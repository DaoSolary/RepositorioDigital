import { AdminActivityClient } from "@/components/admin/AdminActivityClient";

export default function AdminActivityPage() {
  return (
    <div className="space-y-4">
      <div className="surface-card p-5">
        <h2 className="section-title text-lg font-semibold">Logs de atividade</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Registro de logins, downloads, alterações e ações administrativas.
        </p>
      </div>
      <AdminActivityClient />
    </div>
  );
}
