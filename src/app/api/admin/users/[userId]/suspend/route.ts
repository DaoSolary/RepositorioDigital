import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { logActivity, getRequestMeta } from "@/lib/activity";
import { writeAudit } from "@/lib/audit";
import { z } from "zod";

const BodySchema = z.object({
  suspended: z.boolean(),
  reason: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { isAdmin, user } = await assertAdmin();
  if (!isAdmin || !user) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const { userId } = await params;
  const body = BodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const service = await createSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ error: "Service role não configurada." }, { status: 500 });

  const { error } = await service.from("user_status").upsert({
    user_id: userId,
    suspended: body.data.suspended,
    suspended_at: body.data.suspended ? new Date().toISOString() : null,
    suspended_reason: body.data.reason ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const meta = getRequestMeta(req);
  await logActivity({
    userId: user.id,
    action: "admin_suspend_user",
    resourceType: "user",
    resourceId: userId,
    metadata: { suspended: body.data.suspended },
    ...meta,
  }).catch(() => null);

  await writeAudit({
    actorId: user.id,
    action: body.data.suspended ? "suspend" : "unsuspend",
    tableName: "user_status",
    recordId: userId,
    newData: body.data,
  }).catch(() => null);

  return NextResponse.json({ ok: true });
}
