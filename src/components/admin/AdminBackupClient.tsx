"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/ToastProvider";

type BackupRun = {
  id: string;
  status: string;
  file_count: number;
  created_at: string;
  metadata: Record<string, unknown>;
};

export function AdminBackupClient() {
  const { pushToast } = useToast();
  const [runs, setRuns] = React.useState<BackupRun[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function loadRuns() {
    const res = await fetch("/api/admin/backup");
    const json = await res.json();
    setRuns(json.items ?? []);
  }

  React.useEffect(() => {
    loadRuns();
  }, []);

  async function runBackup() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha no backup.");
      const blob = new Blob([JSON.stringify(json.download, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-acervo-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      await loadRuns();
      pushToast("success", "Backup gerado e download iniciado.");
    } catch (e: unknown) {
      pushToast("error", e instanceof Error ? e.message : "Erro no backup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={runBackup} disabled={loading}>
        {loading ? "Gerando backup…" : "Executar backup agora"}
      </Button>

      <div className="space-y-2">
        {runs.map((run) => (
          <Card key={run.id} className="p-4 text-sm">
            <div className="flex justify-between">
              <StatusBadge
                tone={
                  run.status === "completed"
                    ? "success"
                    : run.status === "failed"
                      ? "danger"
                      : "warning"
                }
                className="capitalize"
              >
                {run.status}
              </StatusBadge>
              <span className="text-xs text-zinc-500">{new Date(run.created_at).toLocaleString("pt-BR")}</span>
            </div>
            <div className="mt-1 text-xs text-zinc-500">{run.file_count} registros exportados</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
