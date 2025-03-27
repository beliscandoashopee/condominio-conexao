
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.5.0";
import { logDebug, logError, logInfo, logWarning, logPayment } from "../utils/logging.ts";
import { processPayment } from "./process-payment.ts";

/**
 * Handle the payment_intent.succeeded event
 */
export async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  stripe: Stripe,
  supabase: SupabaseClient,
  timestamp: string
) {
  logInfo(timestamp, `Processing successful payment intent: ${paymentIntent.id}`);
  logDebug(timestamp, `Payment intent metadata: ${JSON.stringify(paymentIntent.metadata)}`);
  
  // First, check if payment intent has metadata we can use directly
  if (paymentIntent.metadata && paymentIntent.metadata.userId) {
    logDebug(timestamp, `Found userId in payment intent metadata: ${paymentIntent.metadata.userId}`);
    
    // Format metadata properly for processPayment
    const formattedMetadata = {
      userId: paymentIntent.metadata.userId,
      packageId: paymentIntent.metadata.packageId,
      amount: paymentIntent.metadata.creditsAmount || paymentIntent.metadata.amount
    };
    
    logPayment(timestamp, `Processing payment with formatted metadata: ${JSON.stringify(formattedMetadata)}`);
    
    // Use metadata from payment intent
    const result = await processPayment(formattedMetadata, supabase, paymentIntent.id, timestamp);
    logInfo(timestamp, `Payment processing from intent metadata result: ${JSON.stringify(result)}`);
    return result;
  } else {
    // Get the associated checkout session to retrieve metadata
    try {
      logDebug(timestamp, `Looking up sessions for payment intent ${paymentIntent.id}`);
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1,
      });
      
      logDebug(timestamp, `Found ${sessions.data.length} sessions for payment intent ${paymentIntent.id}`);
      
      if (sessions.data.length > 0) {
        const session = sessions.data[0];
        logInfo(timestamp, `Found related checkout session: ${session.id} with metadata: ${JSON.stringify(session.metadata)}`);
        
        // If session has metadata, use it
        if (session.metadata && Object.keys(session.metadata).length > 0) {
          const result = await processPayment(session.metadata, supabase, session.id, timestamp);
          logInfo(timestamp, `Payment processing result: ${JSON.stringify(result)}`);
          return result;
        } 
        // If session has client_reference_id but no metadata, try to use that
        else if (session.client_reference_id) {
          logDebug(timestamp, `Using client_reference_id as userId: ${session.client_reference_id}`);
          
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
              
              logDebug(timestamp, `Constructed metadata: ${JSON.stringify(constructedMetadata)}`);
              
              const result = await processPayment(constructedMetadata, supabase, session.id, timestamp);
              logInfo(timestamp, `Payment processing result: ${JSON.stringify(result)}`);
              return result;
            }
          } catch (error) {
            logError(timestamp, `Error retrieving line items: ${error.message}`);
          }
        } else {
          logWarning(timestamp, "Session found but missing metadata and client_reference_id");
        }
      } else {
        logWarning(timestamp, `No checkout session found for payment intent: ${paymentIntent.id}`);
      }
    } catch (error) {
      logError(timestamp, `Error retrieving checkout session for payment intent: ${error.message}`);
      throw error;
    }
  }
  
  return { success: false, reason: "Could not find or construct metadata" };
}
