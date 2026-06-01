import { NextResponse } from "next/server";
import { getServerAuth } from "@/lib/supabase/session";
import { upsertProfile } from "@/lib/profiles";
import { logActivity, getRequestMeta } from "@/lib/activity";
import { z } from "zod";

const BodySchema = z.object({
  nome: z.string().min(1).max(120).optional(),
  bio: z.string().max(500).optional(),
  instituicao: z.string().max(200).optional(),
  curso: z.string().max(120).optional(),
});

export async function GET() {
  const { supabase, user } = await getServerAuth();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
  const { count: favoritesCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, email_confirmed: !!user.email_confirmed_at },
    profile: profile ?? null,
    favoritesCount: favoritesCount ?? 0,
  });
}

export async function PATCH(req: Request) {
  const { user } = await getServerAuth();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = BodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  try {
    const profile = await upsertProfile(user.id, body.data);
    const meta = getRequestMeta(req);
    await logActivity({ userId: user.id, action: "profile_update", ...meta }).catch(() => null);
    return NextResponse.json({ profile });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar perfil.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
