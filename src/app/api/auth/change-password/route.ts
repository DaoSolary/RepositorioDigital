import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/supabase/session";
import { changePasswordSchema } from "@/lib/validators/auth";
import { signInWithPassword, updateUserPassword } from "@/lib/auth/supabase-auth-api";

export async function POST(req: Request) {
  const body = changePasswordSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    const msg = body.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { user } = await getServerAuth();
  if (!user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const signIn = await signInWithPassword(user.email, body.data.currentPassword);
  if (signIn.error || !signIn.data) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
  }

  const { error } = await updateUserPassword(signIn.data.accessToken, body.data.newPassword);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
