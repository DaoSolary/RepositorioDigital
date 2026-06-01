import { Card } from "@/components/ui/card";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { fetchAdminUsersList } from "@/lib/admin-users";

export default async function AdminUsersPage() {
  const { items, error } = await fetchAdminUsersList();

  return (
    <Card className="p-6">
      <h2 className="section-title text-xl font-semibold">Gestão de usuários</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Criar, suspender, definir permissões, resetar senha e ver atividade.
      </p>
      <div className="mt-6">
        <AdminUsersTable initialItems={items} initialError={error} />
      </div>
    </Card>
  );
}
