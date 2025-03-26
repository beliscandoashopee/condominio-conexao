
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // This is a POST-only endpoint
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  const stripeSignature = req.headers.get('stripe-signature');
  if (!stripeSignature) {
    return new Response(JSON.stringify({ error: 'Stripe signature missing' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  try {
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not set');
    }

    // Get the request body as text for the verification
    const body = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, stripeSignature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: 'Webhook signature verification failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not set');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Extract metadata from the session
      const userId = session.metadata.userId;
      const packageId = session.metadata.packageId;
      const amount = parseInt(session.metadata.amount, 10);
      
      if (!userId || !packageId || isNaN(amount)) {
        throw new Error('Missing or invalid metadata in the Stripe session');
      }
      
      // Process the successful payment by adding credits to the user's account
      
      // 1. Register the transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert([{
          user_id: userId,
          package_id: packageId,
          amount: amount,
          type: 'purchase',
          description: `Compra via Stripe - ID: ${session.id}`
        }]);
      
      if (transactionError) {
        throw new Error(`Failed to record transaction: ${transactionError.message}`);
      }
      
      // 2. Update the user's credit balance using the RPC function
      const { data: updateResult, error: updateError } = await supabase.rpc(
        'update_user_credits',
        { 
          p_user_id: userId, 
          p_amount: amount 
        }
      );
      
      if (updateError) {
        throw new Error(`Failed to update user credits: ${updateError.message}`);
      }
      
      console.log(`Credits added successfully: ${amount} credits for user ${userId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
