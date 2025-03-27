
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { logError, logInfo } from "./logging.ts";

/**
 * Initialize the Supabase client
 */
export const initializeSupabase = (timestamp: string) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    logError(timestamp, "Supabase credentials are not set");
    throw new Error('Supabase credentials are not set');
  }
  
  logInfo(timestamp, `Connecting to Supabase at ${supabaseUrl}`);
  return createClient(supabaseUrl, supabaseServiceKey);
};
