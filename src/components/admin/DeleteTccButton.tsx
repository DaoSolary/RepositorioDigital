"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function DeleteTccButton({ id }: { id: string }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onDelete() {
    if (!confirm("Excluir este TCC? Essa ação não pode ser desfeita.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tccs/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Falha ao excluir.");
      window.location.reload();
    } catch (e: any) {
      setError(e?.message ?? "Erro ao excluir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" variant="danger" onClick={onDelete} disabled={loading}>
        {loading ? "Excluindo..." : "Excluir"}
      </Button>
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}

