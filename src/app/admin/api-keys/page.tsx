import { AdminApiKeysClient } from "@/components/admin/AdminApiKeysClient";

export default function AdminApiKeysPage() {
  return (
    <div className="space-y-4">
      <div className="surface-card p-5">
        <h2 className="section-title text-lg font-semibold">Chaves da API pública</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Gere chaves para integração com sites universitários, bibliotecas digitais e apps móveis.
        </p>
      </div>
      <AdminApiKeysClient />
    </div>
  );
}
