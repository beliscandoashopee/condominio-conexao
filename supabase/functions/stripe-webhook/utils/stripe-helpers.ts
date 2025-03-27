
import Stripe from "https://esm.sh/stripe@12.5.0";
import { logDebug, logError, logInfo, logSecurity, logWarning } from "./logging.ts";

/**
 * Initialize and configure the Stripe client
 */
export const initializeStripe = (timestamp: string): Stripe => {
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  
  if (!stripeSecretKey) {
    logError(timestamp, "STRIPE_SECRET_KEY environment variable is not set");
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  
  logInfo(timestamp, "STRIPE_SECRET_KEY found");
  
  return new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });
};

/**
 * Parse webhook event with optional signature verification
 */
export const parseWebhookEvent = async (
  body: string, 
  stripe: Stripe, 
  stripeSignature: string | null, 
  timestamp: string
): Promise<Stripe.Event> => {
  // Get the webhook secret from environment variables
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  if (!webhookSecret) {
    logWarning(timestamp, "STRIPE_WEBHOOK_SECRET not set - proceeding anyway for testing");
  } else {
    logInfo(timestamp, "STRIPE_WEBHOOK_SECRET found");
  }
  
  // Parse the event with or without verification
  try {
    if (webhookSecret && stripeSignature) {
      // Only verify the signature if both webhook secret and signature are present
      logSecurity(timestamp, "Verifying webhook signature with secret key");
      if (stripeSignature) {
        logSecurity(timestamp, `Signature received: ${stripeSignature.substring(0, 20)}...`);
      }
      
      const event = stripe.webhooks.constructEvent(body, stripeSignature, webhookSecret);
      logInfo(timestamp, "Webhook signature verified");
      return event;
    } else {
      // For testing: parse the body directly without verification
      logWarning(timestamp, "Processing webhook without signature verification (TESTING MODE)");
      const event = JSON.parse(body);
      logDebug(timestamp, `Event parsed directly: ${event.type}`);
      return event as Stripe.Event;
    }
  } catch (err) {
    logError(timestamp, `Webhook signature verification failed: ${err.message}`);
    
    if (stripeSignature) {
      logError(timestamp, `Stripe signature received: ${stripeSignature.substring(0, 20)}...`);
    }
    
    // For debugging, try to parse the event to see what we're receiving
    try {
      const rawEvent = JSON.parse(body);
      logDebug(timestamp, `Raw event type: ${rawEvent.type}`);
      logDebug(timestamp, `Raw event ID: ${rawEvent.id}`);
    } catch (parseError) {
      logError(timestamp, `Could not parse raw event: ${parseError.message}`);
    }
    
    throw err;
  }
};

/**
 * Extract summary data from event safely for logging
 */
export const getEventDataSummary = (event: Stripe.Event): Record<string, any> => {
  return {
    object: event.data.object.object,
    id: event.data.object.id,
    ...(event.data.object.metadata && { metadata: event.data.object.metadata }),
    ...(event.data.object.payment_status && { payment_status: event.data.object.payment_status }),
    ...(event.data.object.status && { status: event.data.object.status }),
    ...(event.data.object.client_reference_id && { client_reference_id: event.data.object.client_reference_id }),
  };
};
