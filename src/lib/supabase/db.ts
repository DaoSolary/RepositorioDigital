import "@/lib/supabase/dev-tls";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const noAuth = {
  persistSession: false,
  autoRefreshToken: false,
  detectSessionInUrl: false,
} as const;

let anonClient: SupabaseClient | null = null;

/** Cliente Supabase só para dados — sem cookies e sem refresh de sessão. */
export function createSupabaseDbClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: noAuth },
    );
  }
  return anonClient;
}
