
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
    console.error(`Invalid request method: ${req.method}`);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  const stripeSignature = req.headers.get('stripe-signature');
  if (!stripeSignature) {
    console.error('Request missing Stripe signature header');
    return new Response(JSON.stringify({ error: 'Stripe signature missing' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }

  try {
    console.log('Stripe webhook function invoked');
    
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }

    // Get the request body as text for the verification
    const body = await req.text();
    console.log(`Received webhook payload with length: ${body.length} bytes`);
    
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
    console.log(`Received webhook event type: ${event.type}`);
    console.log(`Event ID: ${event.id}`);
    console.log(`Event data object: ${JSON.stringify(event.data.object)}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not set');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log(`Processing checkout session: ${session.id}`);
      console.log(`Session metadata: ${JSON.stringify(session.metadata)}`);
      console.log(`Payment status: ${session.payment_status}`);
      
      // Check if payment was completed
      if (session.payment_status === 'paid') {
        console.log(`Session ${session.id} is paid, processing payment`);
        
        // Process the payment from the session
        await processPayment(session.metadata, supabase, session.id);
      } else {
        console.log(`Ignoring unpaid session: ${session.id}, payment_status: ${session.payment_status}`);
      }
    } 
    // Handle the payment_intent.succeeded event
    else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log(`Processing successful payment intent: ${paymentIntent.id}`);
      
      // Get the associated checkout session to retrieve metadata
      try {
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });
        
        console.log(`Found ${sessions.data.length} sessions for payment intent ${paymentIntent.id}`);
        
        if (sessions.data.length > 0) {
          const session = sessions.data[0];
          console.log(`Found related checkout session: ${session.id} with metadata: ${JSON.stringify(session.metadata)}`);
          
          // Process the payment using session metadata
          await processPayment(session.metadata, supabase, session.id);
        } else {
          console.log(`No checkout session found for payment intent: ${paymentIntent.id}`);
        }
      } catch (error) {
        console.error(`Error retrieving checkout session for payment intent: ${error.message}`);
      }
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ 
      received: true,
      message: 'Webhook processed successfully',
      eventType: event.type,
      eventId: event.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper function to process payments and add credits
async function processPayment(metadata, supabase, sessionId) {
  console.log(`Starting processPayment for session ${sessionId}`);
  
  if (!metadata) {
    console.error('No metadata found in the session');
    throw new Error('No metadata found in the session');
  }

  // Extract metadata
  const userId = metadata.userId;
  const packageId = metadata.packageId;
  const amount = parseInt(metadata.amount, 10);
  
  console.log(`Processing payment with metadata: userId=${userId}, packageId=${packageId}, amount=${amount}`);
  
  if (!userId || !packageId || isNaN(amount)) {
    console.error(`Missing or invalid metadata: userId=${userId}, packageId=${packageId}, amount=${amount}`);
    throw new Error(`Missing or invalid metadata: userId=${userId}, packageId=${packageId}, amount=${amount}`);
  }
  
  // 1. Register the transaction
  console.log(`Registering credit transaction for user ${userId}`);
  const { data: transactionData, error: transactionError } = await supabase
    .from('credit_transactions')
    .insert([{
      user_id: userId,
      package_id: packageId,
      amount: amount,
      type: 'purchase',
      description: `Compra via Stripe - ID: ${sessionId}`
    }])
    .select();
  
  if (transactionError) {
    console.error(`Failed to record transaction: ${JSON.stringify(transactionError)}`);
    throw new Error(`Failed to record transaction: ${transactionError.message}`);
  }
  
  console.log(`Transaction recorded with ID: ${transactionData[0].id}`);
  
  // 2. Update the user's credit record using the RPC function
  console.log(`Updating credits for user ${userId} with amount ${amount}`);
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
  
  // 3. Double-check if credits were actually added by querying the user_credits table
  const { data: userCredits, error: userCreditsError } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single();
    
  if (userCreditsError) {
    console.error(`Failed to verify user credits: ${JSON.stringify(userCreditsError)}`);
  } else {
    console.log(`Current user credit balance: ${userCredits?.balance || 'unknown'}`);
  }
  
  return true;
}
