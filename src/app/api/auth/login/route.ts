import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { issueAppSessionToken } from "@/lib/auth/issue-session";
import {
  clearLegacySupabaseCookies,
  collectSupabaseCookieNames,
  setAppSessionCookie,
} from "@/lib/auth/cookies";
import { signInWithPassword } from "@/lib/auth/supabase-auth-api";
import { isUserSuspended } from "@/lib/profiles";
import { logActivity, getRequestMeta } from "@/lib/activity";
import { loginSchema } from "@/lib/validators/auth";
import { enforceRateLimit } from "@/lib/security/api-guard";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "login");
  if (limited) return limited;

  const body = loginSchema.safeParse(await req.json().catch(() => null));

  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { data, error } = await signInWithPassword(body.data.email, body.data.password);

  if (error || !data) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  if (await isUserSuspended(data.user.id)) {
    return NextResponse.json(
      { error: "Conta suspensa. Entre em contato com o administrador." },
      { status: 403 },
    );
  }

  const meta = getRequestMeta(req);
  await logActivity({ userId: data.user.id, action: "login", ...meta }).catch(() => null);

  const token = await issueAppSessionToken(data.user.id, data.user.email);
  const res = NextResponse.json({ ok: true });
  setAppSessionCookie(res, token);

  const cookieStore = await cookies();
  clearLegacySupabaseCookies(res, collectSupabaseCookieNames(cookieStore.getAll()));

  return res;
}
