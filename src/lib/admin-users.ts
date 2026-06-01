import { assertAdmin } from "@/lib/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export type AdminUserRow = {
  id: string;
  email: string | null;
  created_at: string | null;
  email_confirmed: boolean;
  last_sign_in: string | null;
  role: "ADMIN" | "USER";
  nome: string | null;
  suspended: boolean;
  suspended_reason: string | null;
};

export async function fetchAdminUsersList(): Promise<{
  items: AdminUserRow[];
  error: string | null;
}> {
  const { isAdmin } = await assertAdmin();
  if (!isAdmin) {
    return { items: [], error: "Proibido." };
  }

  const service = await createSupabaseServiceRoleClient();
  if (!service) {
    return { items: [], error: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." };
  }

  const { data, error } = await service.auth.admin.listUsers({ perPage: 200 });
  if (error) {
    return { items: [], error: error.message };
  }

  const [{ data: roles, error: rolesErr }, { data: statuses }, { data: profiles }] =
    await Promise.all([
      service.from("roles").select("user_id,role"),
      service.from("user_status").select("user_id,suspended,suspended_reason"),
      service.from("profiles").select("user_id,nome"),
    ]);

  if (rolesErr) {
    return { items: [], error: rolesErr.message };
  }

  const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role as string]));
  const statusMap = new Map((statuses ?? []).map((s) => [s.user_id, s]));
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p.nome]));

  return {
    items: (data.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? null,
      created_at: u.created_at ?? null,
      email_confirmed: !!u.email_confirmed_at,
      last_sign_in: u.last_sign_in_at ?? null,
      role: (roleMap.get(u.id) as "ADMIN" | "USER" | undefined) ?? "USER",
      nome: profileMap.get(u.id) ?? null,
      suspended: statusMap.get(u.id)?.suspended ?? false,
      suspended_reason: statusMap.get(u.id)?.suspended_reason ?? null,
    })),
    error: null,
  };
}
