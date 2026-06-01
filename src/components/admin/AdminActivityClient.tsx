"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";

type LogRow = {
  id: number;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  user_id: string | null;
};

export function AdminActivityClient() {
  const [items, setItems] = React.useState<LogRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState("");

  React.useEffect(() => {
    fetch("/api/admin/activity?limit=100")
      .then((r) => r.json())
      .then((j) => setItems(j.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-zinc-500">Carregando…</div>;

  const filtered = items.filter((log) =>
    !filter.trim() ? true : log.action.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <input
        className="h-11 w-full rounded-xl border border-zinc-200/80 bg-white px-3.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        placeholder="Filtrar ação (ex.: login, download, create)"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {filtered.map((log) => (
        <Card key={log.id} className="p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge tone="info">{log.action}</StatusBadge>
              <span className="font-medium">{log.resource_type ?? "Sistema"}</span>
            </div>
            <span className="text-xs text-zinc-500">
              {new Date(log.created_at).toLocaleString("pt-BR")}
            </span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            {log.resource_type ? `${log.resource_type}:${log.resource_id ?? "—"}` : "—"}
            {log.user_id ? ` • user:${log.user_id.slice(0, 8)}…` : ""}
          </div>
        </Card>
      ))}
      {filtered.length === 0 ? <div className="text-sm text-zinc-500">Nenhum registro.</div> : null}
    </div>
  );
}
