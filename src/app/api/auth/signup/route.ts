import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";
import { logActivity, getRequestMeta } from "@/lib/activity";
import { loginSchema } from "@/lib/validators/auth";
import { signUpWithEmail } from "@/lib/auth/supabase-auth-api";
import { enforceRateLimit } from "@/lib/security/api-guard";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "signup");
  if (limited) return limited;

  const body = loginSchema.safeParse(await req.json().catch(() => null));

  if (!body.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const siteUrl = getSiteUrl();
  const { data, error } = await signUpWithEmail(
    body.data.email,
    body.data.password,
    `${siteUrl}/auth/callback?next=/`,
  );

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const meta = getRequestMeta(req);
  if (data?.user) {
    await logActivity({
      userId: data.user.id,
      action: "signup",
      ...meta,
    }).catch(() => null);
  }

  return NextResponse.json({
    ok: true,
    needsEmailConfirmation: data?.needsEmailConfirmation ?? true,
    message: data?.needsEmailConfirmation
      ? "Conta criada. Verifique seu email para confirmar o cadastro."
      : "Conta criada com sucesso.",
  });
}
