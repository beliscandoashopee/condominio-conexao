
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

    // Log received event for debugging
    console.log(`Received webhook event: ${event.type}`);
    console.log(`Event data: ${JSON.stringify(event.data.object)}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not set');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the event - ONLY process checkout.session.completed with paid status
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Verificar se o pagamento foi realmente concluído
      if (session.payment_status !== 'paid') {
        console.log(`Ignoring unpaid session: ${session.id}, payment_status: ${session.payment_status}`);
        return new Response(JSON.stringify({ 
          received: true,
          message: 'Session received, but payment not completed yet' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
      
      console.log(`Processing paid checkout session: ${session.id}`);
      
      // Extract metadata from the session
      const userId = session.metadata.userId;
      const packageId = session.metadata.packageId;
      const amount = parseInt(session.metadata.amount, 10);
      
      if (!userId || !packageId || isNaN(amount)) {
        throw new Error(`Missing or invalid metadata in the Stripe session: userId=${userId}, packageId=${packageId}, amount=${amount}`);
      }
      
      console.log(`User ID: ${userId}, Package ID: ${packageId}, Credits Amount: ${amount}`);
      
      // Process the successful payment by adding credits to the user's account
      
      // 1. Register the transaction
      const { data: transactionData, error: transactionError } = await supabase
        .from('credit_transactions')
        .insert([{
          user_id: userId,
          package_id: packageId,
          amount: amount,
          type: 'purchase',
          description: `Compra via Stripe - ID: ${session.id}`
        }])
        .select();
      
      if (transactionError) {
        console.error(`Failed to record transaction: ${JSON.stringify(transactionError)}`);
        throw new Error(`Failed to record transaction: ${transactionError.message}`);
      }
      
      console.log(`Transaction recorded: ${JSON.stringify(transactionData)}`);
      
      // 2. Check if the user already has a credit record
      const { data: existingRecord, error: checkError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`Error checking for existing user credit: ${JSON.stringify(checkError)}`);
        throw new Error(`Error checking for existing user credit: ${checkError.message}`);
      }
      
      // 3. Update or create the user's credit record using the RPC function
      // The update_user_credits function has security_definer privilege which bypasses RLS
      const { data: updateResult, error: updateError } = await supabase.rpc(
        'update_user_credits',
        { 
          p_user_id: userId, 
          p_amount: amount 
        }
      );
      
      if (updateError) {
        console.error(`Failed to update user credits: ${JSON.stringify(updateError)}`);
        throw new Error(`Failed to update user credits: ${updateError.message}`);
      }
      
      console.log(`Credits added successfully: ${amount} credits for user ${userId}, result: ${updateResult}`);
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ 
      received: true,
      message: 'Webhook processed successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`, error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
