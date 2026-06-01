import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";
import { resetPasswordForEmail } from "@/lib/auth/supabase-auth-api";
import { enforceRateLimit } from "@/lib/security/api-guard";
import { z } from "zod";

const schema = z.object({ email: z.string().email().max(254) });

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "email");
  if (limited) return limited;

  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Email inválido." }, { status: 400 });
  }

  const siteUrl = getSiteUrl();
  const redirectTo = `${siteUrl}/auth/callback?type=recovery`;

  const { error } = await resetPasswordForEmail(body.data.email, redirectTo);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Se o email existir, você receberá um link para redefinir a senha.",
  });
}
