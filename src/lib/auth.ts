import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "ADMIN" | "USER";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getCurrentRole(): Promise<AppRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  return (data?.role as AppRole | undefined) ?? null;
}

export async function requireAdmin() {
  const role = await getCurrentRole();
  if (role !== "ADMIN") {
    const err = new Error("FORBIDDEN");
    (err as any).status = 403;
    throw err;
  }
}

