import "@/lib/supabase/dev-tls";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { createSupabaseDbClient } from "@/lib/supabase/db";

/** @deprecated Use createSupabaseDbClient — não usa cookies nem refresh. */
export async function createSupabaseServerClient() {
  return createSupabaseDbClient();
}

export { createSupabaseDbClient };

export async function createSupabaseServiceRoleClient() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) return null;

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
