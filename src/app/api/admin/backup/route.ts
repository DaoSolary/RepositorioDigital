import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { writeAudit } from "@/lib/audit";

export async function GET() {
  const { isAdmin } = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const service = await createSupabaseServiceRoleClient();
  if (!service) {
    return NextResponse.json({ error: "Service role não configurada." }, { status: 500 });
  }

  const { data } = await service
    .from("backup_runs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ items: data ?? [] });
}

export async function POST() {
  const { isAdmin, user } = await assertAdmin();
  if (!isAdmin || !user) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const service = await createSupabaseServiceRoleClient();
  if (!service) {
    return NextResponse.json({ error: "Service role não configurada." }, { status: 500 });
  }

  const { data: run, error: runErr } = await service
    .from("backup_runs")
    .insert({ status: "running", metadata: { triggered_by: user.email } })
    .select()
    .single();

  if (runErr) return NextResponse.json({ error: runErr.message }, { status: 500 });

  try {
    const [{ data: tccs }, { data: profiles }, { data: roles }] = await Promise.all([
      service.from("tccs").select("*"),
      service.from("profiles").select("*"),
      service.from("roles").select("*"),
    ]);

    const backup = {
      exported_at: new Date().toISOString(),
      tccs: tccs ?? [],
      profiles: profiles ?? [],
      roles: roles ?? [],
    };

    const fileCount = (tccs?.length ?? 0) + (profiles?.length ?? 0) + (roles?.length ?? 0);

    await service
      .from("backup_runs")
      .update({
        status: "success",
        file_count: fileCount,
        metadata: {
          triggered_by: user.email,
          size_bytes: JSON.stringify(backup).length,
          tables: ["tccs", "profiles", "roles"],
        },
      })
      .eq("id", run.id);

    await logActivity({
      userId: user.id,
      action: "backup_run",
      metadata: { backup_id: run.id, file_count: fileCount },
    }).catch(() => null);

    await writeAudit({
      actorId: user.id,
      action: "backup",
      tableName: "backup_runs",
      recordId: run.id,
      newData: { file_count: fileCount },
    }).catch(() => null);

    return NextResponse.json({
      ok: true,
      backup_id: run.id,
      file_count: fileCount,
      download: backup,
    });
  } catch (e: unknown) {
    await service.from("backup_runs").update({ status: "failed" }).eq("id", run.id);
    const msg = e instanceof Error ? e.message : "Falha no backup.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
