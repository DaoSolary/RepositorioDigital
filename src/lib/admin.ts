import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function assertAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, isAdmin: false };
  }

  const { data: roleRow } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return { supabase, user, isAdmin: roleRow?.role === "ADMIN" };
}

