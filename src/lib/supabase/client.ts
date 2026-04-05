import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/config/env";

let singletonClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!env.hasSupabaseCredentials) {
    return null;
  }

  if (!singletonClient) {
    singletonClient = createClient(env.supabaseUrl, env.supabaseAnonKey);
  }

  return singletonClient;
}
