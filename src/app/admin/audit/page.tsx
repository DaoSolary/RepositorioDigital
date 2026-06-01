import { AdminAuditClient } from "@/components/admin/AdminAuditClient";

export default function AdminAuditPage() {
  return (
    <div className="space-y-4">
      <div className="surface-card p-5">
        <h2 className="section-title text-lg font-semibold">Auditoria e histórico</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Alterações críticas realizadas por administradores no sistema.
        </p>
      </div>
      <AdminAuditClient />
    </div>
  );
}
