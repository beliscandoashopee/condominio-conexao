
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { logDebug, logError, logInfo, logProcess, logPayment, logWarning } from "../utils/logging.ts";

/**
 * Process payment and add credits to the user
 */
export async function processPayment(
  metadata: Record<string, string>, 
  supabase: SupabaseClient, 
  sessionId: string, 
  timestamp: string
) {
  logProcess(timestamp, `Starting processPayment for session ${sessionId}`);
  
  if (!metadata) {
    logError(timestamp, "No metadata found in the session");
    throw new Error('No metadata found in the session');
  }

  // Extract metadata
  const userId = metadata.userId;
  const packageId = metadata.packageId;
  const amount = parseInt(metadata.amount || metadata.creditsAmount || "0", 10);
  
  logDebug(timestamp, `Processing with metadata: userId=${userId}, packageId=${packageId}, amount=${amount}`);
  
  if (!userId || !packageId || isNaN(amount)) {
    logError(timestamp, `Missing or invalid metadata: userId=${userId}, packageId=${packageId}, amount=${amount}`);
    throw new Error(`Missing or invalid metadata: userId=${userId}, packageId=${packageId}, amount=${amount}`);
  }
  
  try {
    // Check if this transaction has already been processed to avoid duplicates
    logDebug(timestamp, `Checking for existing transaction for session ${sessionId}`);
    const { data: existingTransaction, error: checkError } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('description', `Compra via Stripe - ID: ${sessionId}`)
      .eq('user_id', userId)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      // Real error, not just "not found"
      logError(timestamp, `Error checking for existing transaction: ${JSON.stringify(checkError)}`);
      throw checkError;
    }
    
    if (existingTransaction) {
      logWarning(timestamp, `Transaction already processed for session ${sessionId}`);
      
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
    logDebug(timestamp, `Registering credit transaction for user ${userId}`);
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
      logError(timestamp, `Failed to record transaction: ${JSON.stringify(transactionError)}`);
      throw new Error(`Failed to record transaction: ${transactionError.message}`);
    }
    
    logInfo(timestamp, `Transaction recorded with ID: ${transactionData[0].id}`);
    
    // 2. Update the user's credit record using the RPC function
    logDebug(timestamp, `Updating credits for user ${userId} with amount ${amount}`);
    const { data: updateResult, error: updateError } = await supabase.rpc(
      'update_user_credits',
      { 
        p_user_id: userId, 
        p_amount: amount 
      }
    );
    
    if (updateError) {
      logError(timestamp, `Failed to update user credits: ${JSON.stringify(updateError)}`);
      throw new Error(`Failed to update user credits: ${updateError.message}`);
    }
    
    logInfo(timestamp, `Credits added successfully: ${amount} credits for user ${userId}, result: ${updateResult}`);
    
    // 3. Double-check if credits were actually added by querying the user_credits table
    const { data: userCredits, error: userCreditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
      
    if (userCreditsError) {
      logError(timestamp, `Failed to verify user credits: ${JSON.stringify(userCreditsError)}`);
    } else {
      logPayment(timestamp, `Current user credit balance: ${userCredits?.balance || 'unknown'}`);
    }
    
    return { success: true, newBalance: userCredits?.balance };
  } catch (error) {
    logError(timestamp, `Process payment error: ${error.message}`);
    throw error;
  }
}
