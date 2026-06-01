import type { AppRole } from "@/lib/auth";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

/** Lê role no servidor (service role). Necessário porque app_session não define auth.uid() no PostgREST. */
export async function lookupUserRole(userId: string): Promise<AppRole | null> {
  const service = await createSupabaseServiceRoleClient();
  if (!service) return null;

  const { data, error } = await service
    .from("roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data?.role) return null;
  if (data.role === "ADMIN" || data.role === "USER") return data.role;
  return null;
}
