import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { logActivity, getRequestMeta } from "@/lib/activity";
import { writeAudit } from "@/lib/audit";
import { z } from "zod";

const BodySchema = z.object({
  password: z.string().min(6),
});

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { isAdmin, user } = await assertAdmin();
  if (!isAdmin || !user) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const { userId } = await params;
  const body = BodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Senha inválida (mín. 6 caracteres)." }, { status: 400 });

  const service = await createSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ error: "Service role não configurada." }, { status: 500 });

  const { error } = await service.auth.admin.updateUserById(userId, {
    password: body.data.password,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const meta = getRequestMeta(req);
  await logActivity({
    userId: user.id,
    action: "admin_reset_password",
    resourceType: "user",
    resourceId: userId,
    ...meta,
  }).catch(() => null);

  await writeAudit({
    actorId: user.id,
    action: "reset_password",
    tableName: "users",
    recordId: userId,
  }).catch(() => null);

  return NextResponse.json({ ok: true, message: "Senha redefinida com sucesso." });
}
