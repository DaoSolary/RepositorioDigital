import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { APP_RECOVERY_COOKIE, readRecoverySession } from "@/lib/auth/app-session";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { updateUserPassword } from "@/lib/auth/supabase-auth-api";
import { passwordSchema } from "@/lib/validators/auth";
import { z } from "zod";

const schema = z.object({ password: passwordSchema });

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    const msg = body.error.issues[0]?.message ?? "Senha inválida.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const cookieStore = await cookies();
  const recovery = await readRecoverySession(cookieStore.get(APP_RECOVERY_COOKIE)?.value);
  if (!recovery) {
    return NextResponse.json(
      { error: "Sessão de recuperação expirada. Solicite um novo email." },
      { status: 401 },
    );
  }

  const { error } = await updateUserPassword(recovery.accessToken, body.data.password);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
