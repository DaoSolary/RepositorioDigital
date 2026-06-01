import { AdminBackupClient } from "@/components/admin/AdminBackupClient";

export default function AdminBackupPage() {
  return (
    <div className="space-y-4">
      <div className="surface-card p-5">
        <h2 className="section-title text-lg font-semibold">Backup e segurança</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Exportação automática de metadados do acervo. Recomenda-se agendar via cron externo chamando esta API.
        </p>
      </div>
      <AdminBackupClient />
    </div>
  );
}
