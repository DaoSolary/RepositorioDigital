import { getServerAuth } from "@/lib/supabase/session";
import { lookupUserRole } from "@/lib/roles";

export async function assertAdmin() {
  const { supabase, user } = await getServerAuth();

  if (!user) {
    return { supabase, user: null, isAdmin: false };
  }

  const role = await lookupUserRole(user.id);
  const isAdmin = role === "ADMIN";

  return {
    supabase,
    user,
    isAdmin,
  };
}
