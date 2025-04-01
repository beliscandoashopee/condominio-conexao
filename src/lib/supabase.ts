
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";
import { supabase as integrationSupabase } from "@/integrations/supabase/client";

// In Vite, environment variables are accessed using import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// If both URL and key are available, create a new client; otherwise use the integration client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : integrationSupabase;
