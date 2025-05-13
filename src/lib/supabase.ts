import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://placeholder-supabase-url.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

if (
  import.meta.env.VITE_SUPABASE_URL === undefined ||
  import.meta.env.VITE_SUPABASE_ANON_KEY === undefined
) {
  console.warn(
    "Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables. Using mock data for now."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);