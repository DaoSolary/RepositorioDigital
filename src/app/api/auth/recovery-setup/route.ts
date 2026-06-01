import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { attachRecoveryCookie } from "@/lib/auth/recovery-session";
import {
  clearLegacySupabaseCookies,
  collectSupabaseCookieNames,
} from "@/lib/auth/cookies";
import {
  exchangeCodeForSession,
  getUserFromAccessToken,
} from "@/lib/auth/supabase-auth-api";
import { enforceRateLimit } from "@/lib/security/api-guard";
import { z } from "zod";

const schema = z.object({
  accessToken: z.string().min(20).max(4096).optional(),
  code: z.string().min(20).max(512).optional(),
});

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "recoverySetup");
  if (limited) return limited;

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success || (!body.data.accessToken && !body.data.code)) {
    return NextResponse.json({ error: "Link inválido." }, { status: 400 });
  }

  let userId: string;
  let accessToken: string;

  if (body.data.code) {
    const { data, error } = await exchangeCodeForSession(body.data.code);
    if (error || !data) {
      return NextResponse.json(
        { error: error ?? "Link inválido ou expirado." },
        { status: 400 },
      );
    }
    userId = data.user.id;
    accessToken = data.accessToken;
  } else {
    const token = body.data.accessToken!;
    const { data: user, error } = await getUserFromAccessToken(token);
    if (error || !user) {
      return NextResponse.json(
        { error: error ?? "Link inválido ou expirado." },
        { status: 400 },
      );
    }
    userId = user.id;
    accessToken = token;
  }

  const res = NextResponse.json({ ok: true });
  await attachRecoveryCookie(res, userId, accessToken);

  const cookieStore = await cookies();
  clearLegacySupabaseCookies(res, collectSupabaseCookieNames(cookieStore.getAll()));

  return res;
}
