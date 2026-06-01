import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/admin";

const BodySchema = z.object({
  role: z.enum(["ADMIN", "USER"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  const body = BodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const { isAdmin, supabase } = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const { error } = await supabase.from("roles").upsert({ user_id: userId, role: body.data.role });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

