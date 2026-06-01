"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/ToastProvider";

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  active: boolean;
  last_used_at: string | null;
  created_at: string;
};

export function AdminApiKeysClient() {
  const { pushToast } = useToast();
  const [items, setItems] = React.useState<ApiKeyRow[]>([]);
  const [name, setName] = React.useState("");
  const [newKey, setNewKey] = React.useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/api-keys");
    const json = await res.json();
    setItems(json.items ?? []);
  }

  React.useEffect(() => {
    load();
  }, []);

  async function createKey(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!res.ok) {
      pushToast("error", json.error || "Erro ao criar chave.");
      return;
    }
    setNewKey(json.key);
    setName("");
    await load();
    pushToast("success", "Chave gerada com sucesso.");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={createKey} className="flex gap-2">
        <Input placeholder="Nome da integração" value={name} onChange={(e) => setName(e.target.value)} required />
        <Button type="submit">Gerar chave</Button>
      </form>

      {newKey ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <div className="font-medium text-amber-800 dark:text-amber-200">Chave gerada (copie agora):</div>
          <code className="mt-2 block break-all text-xs">{newKey}</code>
        </Card>
      ) : null}

      <div className="space-y-2">
        {items.map((k) => (
          <Card key={k.id} className="p-4 text-sm">
            <div className="font-medium">{k.name}</div>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
              <code>{k.key_prefix}…</code>
              <StatusBadge tone={k.active ? "success" : "neutral"}>
                {k.active ? "Ativa" : "Inativa"}
              </StatusBadge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
