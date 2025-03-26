
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Add request logging with a timestamp
  const timestamp = new Date().toISOString();
  console.log(`🔔 [${timestamp}] Webhook function invoked`);
  console.log(`📝 [${timestamp}] Request URL: ${req.url}`);
  console.log(`📝 [${timestamp}] Request method: ${req.method}`);
  
  try {
    // This is a POST-only endpoint
    if (req.method === 'OPTIONS') {
      console.log(`🟡 [${timestamp}] Handling OPTIONS preflight request`);
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      console.error(`❌ [${timestamp}] Invalid request method: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Log request headers for debugging
    console.log(`🔍 [${timestamp}] Request headers: ${JSON.stringify([...req.headers.entries()])}`);
    
    const stripeSignature = req.headers.get('stripe-signature');
    if (!stripeSignature) {
      console.error(`❌ [${timestamp}] Request missing Stripe signature header`);
      return new Response(JSON.stringify({ error: 'Stripe signature missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.error(`❌ [${timestamp}] STRIPE_SECRET_KEY environment variable is not set`);
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    console.log(`✅ [${timestamp}] STRIPE_SECRET_KEY found`);
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Get the webhook secret from environment variables
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error(`❌ [${timestamp}] STRIPE_WEBHOOK_SECRET environment variable is not set`);
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }
    console.log(`✅ [${timestamp}] STRIPE_WEBHOOK_SECRET found`);

    // Get the request body as text for the verification
    let body;
    try {
      body = await req.text();
      console.log(`✅ [${timestamp}] Received webhook payload length: ${body.length} bytes`);
      
      if (body.length === 0) {
        console.error(`❌ [${timestamp}] Empty request body`);
        throw new Error('Empty request body');
      }
      
      // Log a sample of the body (truncated for security)
      const bodySample = body.length > 100 ? body.substring(0, 100) + '...' : body;
      console.log(`📝 [${timestamp}] Webhook payload sample: ${bodySample}`);
    } catch (error) {
      console.error(`❌ [${timestamp}] Error reading request body: ${error.message}`);
      throw error;
    }
    
    // Verify the webhook signature
    let event;
    try {
      console.log(`🔑 [${timestamp}] Verifying webhook signature with secret key`);
      event = stripe.webhooks.constructEvent(body, stripeSignature, webhookSecret);
      console.log(`✅ [${timestamp}] Webhook signature verified`);
    } catch (err) {
      console.error(`❌ [${timestamp}] Webhook signature verification failed: ${err.message}`);
      console.error(`❌ [${timestamp}] Stripe signature received: ${stripeSignature.substring(0, 20)}...`);
      return new Response(JSON.stringify({ 
        error: 'Webhook signature verification failed', 
        details: err.message,
        receivedSignature: stripeSignature.substring(0, 20) + '...'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Log received event for debugging
    console.log(`📝 [${timestamp}] Event type: ${event.type}`);
    console.log(`📝 [${timestamp}] Event ID: ${event.id}`);
    
    // Log parts of the event data, but be careful not to log sensitive information
    const eventDataSummary = {
      object: event.data.object.object,
      id: event.data.object.id,
      ...(event.data.object.metadata && { metadata: event.data.object.metadata }),
      ...(event.data.object.payment_status && { payment_status: event.data.object.payment_status }),
      ...(event.data.object.status && { status: event.data.object.status }),
      ...(event.data.object.client_reference_id && { client_reference_id: event.data.object.client_reference_id }),
    };
    console.log(`📝 [${timestamp}] Event data summary: ${JSON.stringify(eventDataSummary, null, 2)}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(`❌ [${timestamp}] Supabase credentials are not set`);
      throw new Error('Supabase credentials are not set');
    }
    
    console.log(`🔌 [${timestamp}] Connecting to Supabase at ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log(`🔄 [${timestamp}] Processing checkout session: ${session.id}`);
      console.log(`📊 [${timestamp}] Session metadata: ${JSON.stringify(session.metadata)}`);
      console.log(`💰 [${timestamp}] Payment status: ${session.payment_status}`);
      console.log(`👤 [${timestamp}] Customer: ${session.customer}`);
      console.log(`🔑 [${timestamp}] Client reference ID: ${session.client_reference_id}`);
      
      // Check if payment was completed
      if (session.payment_status === 'paid') {
        console.log(`💵 [${timestamp}] Session ${session.id} is paid, processing payment`);
        
        // Get the metadata - either from session.metadata or construct from session info
        let metadata = session.metadata;
        
        // If metadata is empty but client_reference_id exists, construct metadata
        if ((!metadata || Object.keys(metadata).length === 0) && session.client_reference_id) {
          console.log(`⚠️ [${timestamp}] No metadata found, constructing from client_reference_id`);
          
          // Get line items to extract amount/price info
          try {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            console.log(`📋 [${timestamp}] Line items: ${JSON.stringify(lineItems.data)}`);
            
            if (lineItems && lineItems.data.length > 0) {
              // Construct metadata from available information
              metadata = {
                userId: session.client_reference_id,
                // Try to extract packageId from the success_url if available
                packageId: session.success_url ? 
                  new URL(session.success_url).searchParams.get('package_id') : 
                  'unknown',
                // Convert amount from cents to actual amount
                amount: lineItems.data[0].amount_total ? 
                  (lineItems.data[0].amount_total / 100).toString() : 
                  '0'
              };
              
              console.log(`🔧 [${timestamp}] Constructed metadata: ${JSON.stringify(metadata)}`);
            }
          } catch (error) {
            console.error(`❌ [${timestamp}] Error retrieving line items: ${error.message}`);
          }
        }
        
        // Process the payment with the metadata
        if (metadata && metadata.userId) {
          const result = await processPayment(metadata, supabase, session.id, timestamp);
          console.log(`✅ [${timestamp}] Payment processing result: ${JSON.stringify(result)}`);
        } else {
          console.error(`❌ [${timestamp}] Missing required metadata, cannot process payment`);
        }
      } else {
        console.log(`⏳ [${timestamp}] Ignoring unpaid session: ${session.id}, payment_status: ${session.payment_status}`);
      }
    } 
    // Handle the payment_intent.succeeded event
    else if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log(`💰 [${timestamp}] Processing successful payment intent: ${paymentIntent.id}`);
      console.log(`📊 [${timestamp}] Payment intent metadata: ${JSON.stringify(paymentIntent.metadata)}`);
      
      // First, check if payment intent has metadata we can use directly
      if (paymentIntent.metadata && paymentIntent.metadata.userId) {
        console.log(`🔍 [${timestamp}] Found userId in payment intent metadata: ${paymentIntent.metadata.userId}`);
        
        // Use metadata from payment intent
        const result = await processPayment(paymentIntent.metadata, supabase, paymentIntent.id, timestamp);
        console.log(`✅ [${timestamp}] Payment processing from intent metadata result: ${JSON.stringify(result)}`);
      } else {
        // Get the associated checkout session to retrieve metadata
        try {
          console.log(`🔍 [${timestamp}] Looking up sessions for payment intent ${paymentIntent.id}`);
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            limit: 1,
          });
          
          console.log(`📋 [${timestamp}] Found ${sessions.data.length} sessions for payment intent ${paymentIntent.id}`);
          
          if (sessions.data.length > 0) {
            const session = sessions.data[0];
            console.log(`✅ [${timestamp}] Found related checkout session: ${session.id} with metadata: ${JSON.stringify(session.metadata)}`);
            
            // If session has metadata, use it
            if (session.metadata && Object.keys(session.metadata).length > 0) {
              const result = await processPayment(session.metadata, supabase, session.id, timestamp);
              console.log(`✅ [${timestamp}] Payment processing result: ${JSON.stringify(result)}`);
            } 
            // If session has client_reference_id but no metadata, try to use that
            else if (session.client_reference_id) {
              console.log(`🔧 [${timestamp}] Using client_reference_id as userId: ${session.client_reference_id}`);
              
              // Try to construct metadata from session and line items
              try {
                const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
                
                if (lineItems && lineItems.data.length > 0) {
                  const constructedMetadata = {
                    userId: session.client_reference_id,
                    // Try to extract packageId from the success_url if available
                    packageId: session.success_url ? 
                      new URL(session.success_url).searchParams.get('package_id') : 
                      'unknown',
                    // Convert amount from cents to actual amount
                    amount: lineItems.data[0].amount_total ? 
                      (lineItems.data[0].amount_total / 100).toString() : 
                      '0'
                  };
                  
                  console.log(`🔧 [${timestamp}] Constructed metadata: ${JSON.stringify(constructedMetadata)}`);
                  
                  const result = await processPayment(constructedMetadata, supabase, session.id, timestamp);
                  console.log(`✅ [${timestamp}] Payment processing result: ${JSON.stringify(result)}`);
                }
              } catch (error) {
                console.error(`❌ [${timestamp}] Error retrieving line items: ${error.message}`);
              }
            } else {
              console.error(`❌ [${timestamp}] Session found but missing metadata and client_reference_id`);
            }
          } else {
            console.log(`⚠️ [${timestamp}] No checkout session found for payment intent: ${paymentIntent.id}`);
          }
        } catch (error) {
          console.error(`❌ [${timestamp}] Error retrieving checkout session for payment intent: ${error.message}`);
          throw error;
        }
      }
    } else {
      console.log(`⏩ [${timestamp}] Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ 
      received: true,
      message: 'Webhook processed successfully',
      eventType: event.type,
      eventId: event.id,
      timestamp: timestamp
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`❌ [${timestamp}] Webhook error: ${error.message}`);
    console.error(`❌ [${timestamp}] Error stack: ${error.stack}`);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack,
      timestamp: timestamp
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper function to process payments and add credits
async function processPayment(metadata, supabase, sessionId, timestamp) {
  console.log(`🔄 [${timestamp}] Starting processPayment for session ${sessionId}`);
  
  if (!metadata) {
    console.error(`❌ [${timestamp}] No metadata found in the session`);
    throw new Error('No metadata found in the session');
  }

  // Extract metadata
  const userId = metadata.userId;
  const packageId = metadata.packageId;
  const amount = parseInt(metadata.amount, 10);
  
  console.log(`📊 [${timestamp}] Processing with metadata: userId=${userId}, packageId=${packageId}, amount=${amount}`);
  
  if (!userId || !packageId || isNaN(amount)) {
    console.error(`❌ [${timestamp}] Missing or invalid metadata: userId=${userId}, packageId=${packageId}, amount=${amount}`);
    throw new Error(`Missing or invalid metadata: userId=${userId}, packageId=${packageId}, amount=${amount}`);
  }
  
  try {
    // Check if this transaction has already been processed to avoid duplicates
    console.log(`🔍 [${timestamp}] Checking for existing transaction for session ${sessionId}`);
    const { data: existingTransaction, error: checkError } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('description', `Compra via Stripe - ID: ${sessionId}`)
      .eq('user_id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      // Real error, not just "not found"
      console.error(`❌ [${timestamp}] Error checking for existing transaction: ${JSON.stringify(checkError)}`);
      throw checkError;
    }
    
    if (existingTransaction) {
      console.log(`⚠️ [${timestamp}] Transaction already processed for session ${sessionId}`);
      
      // Get current balance to return
      const { data: userCredits } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single();
        
      return { 
        success: true, 
        alreadyProcessed: true,
        newBalance: userCredits?.balance || 0
      };
    }
  
    // 1. Register the transaction
    console.log(`📝 [${timestamp}] Registering credit transaction for user ${userId}`);
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
      console.error(`❌ [${timestamp}] Failed to record transaction: ${JSON.stringify(transactionError)}`);
      throw new Error(`Failed to record transaction: ${transactionError.message}`);
    }
    
    console.log(`✅ [${timestamp}] Transaction recorded with ID: ${transactionData[0].id}`);
    
    // 2. Update the user's credit record using the RPC function
    console.log(`💳 [${timestamp}] Updating credits for user ${userId} with amount ${amount}`);
    const { data: updateResult, error: updateError } = await supabase.rpc(
      'update_user_credits',
      { 
        p_user_id: userId, 
        p_amount: amount 
      }
    );
    
    if (updateError) {
      console.error(`❌ [${timestamp}] Failed to update user credits: ${JSON.stringify(updateError)}`);
      throw new Error(`Failed to update user credits: ${updateError.message}`);
    }
    
    console.log(`✅ [${timestamp}] Credits added successfully: ${amount} credits for user ${userId}, result: ${updateResult}`);
    
    // 3. Double-check if credits were actually added by querying the user_credits table
    const { data: userCredits, error: userCreditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    if (userCreditsError) {
      console.error(`❌ [${timestamp}] Failed to verify user credits: ${JSON.stringify(userCreditsError)}`);
    } else {
      console.log(`💰 [${timestamp}] Current user credit balance: ${userCredits?.balance || 'unknown'}`);
    }
    
    return { success: true, newBalance: userCredits?.balance };
  } catch (error) {
    console.error(`❌ [${timestamp}] Process payment error: ${error.message}`);
    throw error;
  }
}
