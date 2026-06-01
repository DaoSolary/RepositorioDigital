import { createSupabaseDbClient } from "@/lib/supabase/db";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export type ActivityAction =
  | "login"
  | "logout"
  | "signup"
  | "view_tcc"
  | "download_tcc"
  | "favorite_tcc"
  | "profile_update"
  | "password_change"
  | "admin_create_tcc"
  | "admin_update_tcc"
  | "admin_delete_tcc"
  | "admin_suspend_user"
  | "admin_reset_password"
  | "admin_create_user"
  | "backup_run";

export async function logActivity(params: {
  userId?: string | null;
  action: ActivityAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const service = await createSupabaseServiceRoleClient();
  const client = service ?? createSupabaseDbClient();

  await client.rpc("log_activity", {
    p_user_id: params.userId ?? null,
    p_action: params.action,
    p_resource_type: params.resourceType ?? null,
    p_resource_id: params.resourceId ?? null,
    p_metadata: params.metadata ?? {},
    p_ip_address: params.ipAddress ?? null,
    p_user_agent: params.userAgent ?? null,
  });
}

export function getRequestMeta(req: Request) {
  return {
    ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
  };
}
