import { cache } from "react";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { APP_SESSION_COOKIE, readAppSession } from "@/lib/auth/app-session";
import { createSupabaseDbClient } from "@/lib/supabase/db";

export const getSupabaseServer = cache(() => createSupabaseDbClient());

type ServerAuth = {
  supabase: ReturnType<typeof createSupabaseDbClient>;
  user: User | null;
};

/** Identidade apenas pelo cookie app_session assinado — não confia em headers HTTP. */
export const getServerAuth = cache(async (): Promise<ServerAuth> => {
  const supabase = getSupabaseServer();
  const cookieStore = await cookies();
  const session = await readAppSession(cookieStore.get(APP_SESSION_COOKIE)?.value);

  if (!session) {
    return { supabase, user: null };
  }

  return {
    supabase,
    user: { id: session.uid, email: session.email } as User,
  };
});

export const getServerUser = cache(async () => {
  const { user } = await getServerAuth();
  return user;
});
