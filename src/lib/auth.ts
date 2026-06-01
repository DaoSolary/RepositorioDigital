import { cache } from "react";
import { cookies } from "next/headers";
import { APP_SESSION_COOKIE, readAppSession } from "@/lib/auth/app-session";
import { getServerAuth } from "@/lib/supabase/session";
import { lookupUserRole } from "@/lib/roles";

export type AppRole = "ADMIN" | "USER";

export async function getCurrentUser() {
  const { user } = await getServerAuth();
  return user;
}

export const getCurrentRole = cache(async (): Promise<AppRole | null> => {
  const { user } = await getServerAuth();
  if (!user) return null;

  const cookieStore = await cookies();
  const session = await readAppSession(cookieStore.get(APP_SESSION_COOKIE)?.value);
  if (session?.uid === user.id && session.role) {
    return session.role;
  }

  return lookupUserRole(user.id);
});

export async function requireAdmin() {
  const role = await getCurrentRole();
  if (role !== "ADMIN") {
    const err = new Error("FORBIDDEN");
    (err as unknown as { status: number }).status = 403;
    throw err;
  }
}

export const getHeaderAuth = cache(async () => {
  const { supabase, user } = await getServerAuth();
  if (!user) {
    return { user: null, role: null as AppRole | null, profileName: null as string | null };
  }

  const [role, { data: profile, error: profileError }] = await Promise.all([
    getCurrentRole(),
    supabase.from("profiles").select("nome").eq("user_id", user.id).maybeSingle(),
  ]);

  return {
    user: { id: user.id, email: user.email },
    role,
    profileName: profileError ? null : (profile?.nome ?? null),
  };
});
