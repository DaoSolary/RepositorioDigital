import { createSupabaseDbClient } from "@/lib/supabase/db";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function writeAudit(params: {
  actorId: string;
  action: string;
  tableName: string;
  recordId?: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}) {
  const service = await createSupabaseServiceRoleClient();
  const client = service ?? createSupabaseDbClient();

  await client.rpc("write_audit", {
    p_actor_id: params.actorId,
    p_action: params.action,
    p_table_name: params.tableName,
    p_record_id: params.recordId ?? null,
    p_old_data: params.oldData ?? null,
    p_new_data: params.newData ?? null,
  });
}

export async function recordTccHistory(params: {
  tccId: string;
  changedBy: string;
  action: "create" | "update" | "delete";
  snapshot: Record<string, unknown>;
}) {
  const service = await createSupabaseServiceRoleClient();
  if (!service) return;

  await service.from("tcc_history").insert({
    tcc_id: params.tccId,
    changed_by: params.changedBy,
    action: params.action,
    snapshot: params.snapshot,
  });
}
