import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { logActivity, getRequestMeta } from "@/lib/activity";
import { writeAudit } from "@/lib/audit";
import { z } from "zod";

const BodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
  nome: z.string().optional(),
});

export async function POST(req: Request) {
  const { isAdmin, user } = await assertAdmin();
  if (!isAdmin || !user) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const body = BodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const service = await createSupabaseServiceRoleClient();
  if (!service) {
    return NextResponse.json({ error: "Service role não configurada." }, { status: 500 });
  }

  const { data: created, error } = await service.auth.admin.createUser({
    email: body.data.email,
    password: body.data.password,
    email_confirm: true,
    user_metadata: { full_name: body.data.nome },
  });

  if (error || !created.user) {
    return NextResponse.json({ error: error?.message ?? "Falha ao criar usuário." }, { status: 400 });
  }

  await service.from("roles").upsert({ user_id: created.user.id, role: body.data.role });
  if (body.data.nome) {
    await service.from("profiles").upsert({ user_id: created.user.id, nome: body.data.nome });
  }

  const meta = getRequestMeta(req);
  await logActivity({
    userId: user.id,
    action: "admin_create_user",
    resourceType: "user",
    resourceId: created.user.id,
    metadata: { email: body.data.email, role: body.data.role },
    ...meta,
  }).catch(() => null);

  await writeAudit({
    actorId: user.id,
    action: "create",
    tableName: "users",
    recordId: created.user.id,
    newData: { email: body.data.email, role: body.data.role },
  }).catch(() => null);

  return NextResponse.json({
    ok: true,
    user: { id: created.user.id, email: created.user.email, role: body.data.role },
  });
}
