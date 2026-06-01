"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";

type AuditRow = {
  id: number;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
  actor_id: string | null;
};

export function AdminAuditClient() {
  const [items, setItems] = React.useState<AuditRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tableFilter, setTableFilter] = React.useState("");

  React.useEffect(() => {
    fetch("/api/admin/audit?limit=100")
      .then((r) => r.json())
      .then((j) => setItems(j.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-zinc-500">Carregando…</div>;

  const filtered = items.filter((row) =>
    !tableFilter.trim() ? true : row.table_name.toLowerCase().includes(tableFilter.trim().toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <input
        className="h-11 w-full rounded-xl border border-zinc-200/80 bg-white px-3.5 text-sm dark:border-zinc-800 dark:bg-zinc-950"
        placeholder="Filtrar por tabela (ex.: tccs, users, roles)"
        value={tableFilter}
        onChange={(e) => setTableFilter(e.target.value)}
      />
      {filtered.map((row) => (
        <Card key={row.id} className="p-4 text-sm">
          <div className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <StatusBadge tone="warning">{row.action}</StatusBadge>
              <span className="font-medium">em {row.table_name}</span>
            </div>
            <span className="text-xs text-zinc-500">{new Date(row.created_at).toLocaleString("pt-BR")}</span>
          </div>
          {row.record_id ? <div className="mt-1 text-xs text-zinc-500">ID: {row.record_id}</div> : null}
        </Card>
      ))}
      {filtered.length === 0 ? <div className="text-sm text-zinc-500">Nenhum registro.</div> : null}
    </div>
  );
}
