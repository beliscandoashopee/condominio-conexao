
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { logDebug, logError, logInfo, logInspect, logProcess, logWarning } from "./utils/logging.ts";
import { corsHeaders, SUPPORTED_WEBHOOK_EVENTS } from "./utils/constants.ts";
import { initializeStripe, parseWebhookEvent, getEventDataSummary } from "./utils/stripe-helpers.ts";
import { initializeSupabase } from "./utils/supabase-client.ts";
import { handleCheckoutCompleted } from "./handlers/checkout-completed.ts";
import { handlePaymentIntentSucceeded } from "./handlers/payment-intent-succeeded.ts";

serve(async (req) => {
  // Add request logging with a timestamp
  const timestamp = new Date().toISOString();
  logInfo(timestamp, "Webhook function invoked");
  logDebug(timestamp, `Request URL: ${req.url}`);
  logDebug(timestamp, `Request method: ${req.method}`);
  
  try {
    // This is a POST-only endpoint
    if (req.method === 'OPTIONS') {
      logProcess(timestamp, "Handling OPTIONS preflight request");
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      logError(timestamp, `Invalid request method: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Log request headers for debugging
    const headersEntries = [...req.headers.entries()];
    logInspect(timestamp, `Request headers: ${JSON.stringify(headersEntries)}`);
    
    const stripeSignature = req.headers.get('stripe-signature');
    if (!stripeSignature) {
      logWarning(timestamp, "No Stripe signature found in headers");
      // For initial testing we don't fail immediately, but in production this should be required
      // for strict security measures. Implementing a toggle for relaxed/strict mode.
      const isStrictMode = Deno.env.get('STRIPE_WEBHOOK_STRICT_MODE') === 'true';
      if (isStrictMode) {
        return new Response(JSON.stringify({ 
          error: 'Stripe signature required',
          message: 'No stripe-signature header found'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        });
      } else {
        logWarning(timestamp, "Proceeding without signature verification (TESTING MODE)");
      }
    }

    // Initialize Stripe
    const stripe = initializeStripe(timestamp);
    
    // Get the request body as text for the verification
    let body;
    try {
      body = await req.text();
      logInfo(timestamp, `Received webhook payload length: ${body.length} bytes`);
      
      if (body.length === 0) {
        logError(timestamp, "Empty request body");
        throw new Error('Empty request body');
      }
      
      // Log a sample of the body (truncated for security)
      const bodySample = body.length > 100 ? body.substring(0, 100) + '...' : body;
      logDebug(timestamp, `Webhook payload sample: ${bodySample}`);
    } catch (error) {
      logError(timestamp, `Error reading request body: ${error.message}`);
      throw error;
    }
    
    // Parse webhook event
    let event;
    try {
      event = await parseWebhookEvent(body, stripe, stripeSignature, timestamp);
    } catch (err) {
      return new Response(JSON.stringify({ 
        error: 'Webhook signature verification failed', 
        details: err.message,
        receivedSignature: stripeSignature ? stripeSignature.substring(0, 20) + '...' : 'none'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Log received event for debugging
    logDebug(timestamp, `Event type: ${event.type}`);
    logDebug(timestamp, `Event ID: ${event.id}`);
    
    // Check if this is a supported event type
    if (!SUPPORTED_WEBHOOK_EVENTS.includes(event.type)) {
      logWarning(timestamp, `Ignoring unsupported event type: ${event.type}`);
      return new Response(JSON.stringify({ 
        received: true,
        message: 'Event type not handled',
        eventType: event.type
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 202, // Accepted but not processed
      });
    }
    
    // Log parts of the event data, but be careful not to log sensitive information
    const eventDataSummary = getEventDataSummary(event);
    logDebug(timestamp, `Event data summary: ${JSON.stringify(eventDataSummary, null, 2)}`);

    // Initialize Supabase client
    const supabase = initializeSupabase(timestamp);

    // Route events to appropriate handlers
    let result = { handled: false };
    
    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      result = await handleCheckoutCompleted(event.data.object, stripe, supabase, timestamp);
    } 
    // Handle the payment_intent.succeeded event
    else if (event.type === 'payment_intent.succeeded') {
      result = await handlePaymentIntentSucceeded(event.data.object, stripe, supabase, timestamp);
    }

    return new Response(JSON.stringify({ 
      received: true,
      message: 'Webhook processed successfully',
      eventType: event.type,
      eventId: event.id,
      result,
      timestamp: timestamp
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    logError(timestamp, `Webhook error: ${error.message}`);
    logError(timestamp, `Error stack: ${error.stack}`);
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
