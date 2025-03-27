
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@12.5.0";
import { logDebug, logInfo, logWarning } from "../utils/logging.ts";
import { processPayment } from "./process-payment.ts";

/**
 * Handle the checkout.session.completed event
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  supabase: SupabaseClient,
  timestamp: string
) {
  logDebug(timestamp, `Processing checkout session: ${session.id}`);
  logDebug(timestamp, `Session metadata: ${JSON.stringify(session.metadata)}`);
  logDebug(timestamp, `Payment status: ${session.payment_status}`);
  logDebug(timestamp, `Customer: ${session.customer}`);
  logDebug(timestamp, `Client reference ID: ${session.client_reference_id}`);
  
  // Check if payment was completed
  if (session.payment_status === 'paid') {
    logInfo(timestamp, `Session ${session.id} is paid, processing payment`);
    
    // Get the metadata - either from session.metadata or construct from session info
    let metadata = session.metadata;
    
    // If metadata is empty but client_reference_id exists, construct metadata
    if ((!metadata || Object.keys(metadata).length === 0) && session.client_reference_id) {
      logWarning(timestamp, "No metadata found, constructing from client_reference_id");
      
      // Get line items to extract amount/price info
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        logDebug(timestamp, `Line items: ${JSON.stringify(lineItems.data)}`);
        
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
          
          logDebug(timestamp, `Constructed metadata: ${JSON.stringify(metadata)}`);
        }
      } catch (error) {
        logWarning(timestamp, `Error retrieving line items: ${error.message}`);
      }
    }
    
    // Process the payment with the metadata
    if (metadata && metadata.userId) {
      const result = await processPayment(metadata, supabase, session.id, timestamp);
      logInfo(timestamp, `Payment processing result: ${JSON.stringify(result)}`);
      return result;
    } else {
      logWarning(timestamp, "Missing required metadata, cannot process payment");
      return { success: false, error: "Missing required metadata" };
    }
  } else {
    logInfo(timestamp, `Ignoring unpaid session: ${session.id}, payment_status: ${session.payment_status}`);
    return { success: false, reason: "Session not paid" };
  }
}
