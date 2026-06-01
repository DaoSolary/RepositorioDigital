"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/ToastProvider";
import type { AdminUserRow } from "@/lib/admin-users";

export function AdminUsersTable({
  initialItems,
  initialError,
}: {
  initialItems: AdminUserRow[];
  initialError: string | null;
}) {
  const { pushToast } = useToast();
  const [items, setItems] = React.useState<AdminUserRow[]>(initialItems);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(initialError);
  const [showCreate, setShowCreate] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "suspended">("all");
  const [roleFilter, setRoleFilter] = React.useState<"all" | "ADMIN" | "USER">("all");
  const [page, setPage] = React.useState(1);
  const [newUser, setNewUser] = React.useState({ email: "", password: "", nome: "", role: "USER" as const });
  const [resetUserId, setResetUserId] = React.useState<string | null>(null);
  const [newPassword, setNewPassword] = React.useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { credentials: "same-origin" });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = "/login?next=/admin/users&error=session_expired";
        return;
      }
      if (!res.ok) throw new Error(json.error || "Falha ao carregar usuários.");
      setItems(json.items || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(userId: string, role: "ADMIN" | "USER") {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "Falha ao atualizar role.");
      return;
    }
    setItems((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    pushToast("success", "Permissão atualizada com sucesso.");
  }

  async function toggleSuspend(userId: string, suspended: boolean) {
    const reason = suspended ? prompt("Motivo da suspensão (opcional):") ?? undefined : undefined;
    const res = await fetch(`/api/admin/users/${userId}/suspend`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ suspended, reason }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "Falha ao atualizar status.");
      return;
    }
    setItems((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, suspended, suspended_reason: reason ?? null } : u)),
    );
    pushToast("success", suspended ? "Usuário suspenso." : "Usuário reativado.");
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/users/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "Falha ao criar usuário.");
      return;
    }
    setShowCreate(false);
    setNewUser({ email: "", password: "", nome: "", role: "USER" });
    await load();
    pushToast("success", "Usuário criado com sucesso.");
  }

  async function resetPassword(userId: string) {
    if (!newPassword || newPassword.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres.");
      return;
    }
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "Falha ao redefinir senha.");
      return;
    }
    setResetUserId(null);
    setNewPassword("");
    setError(null);
    pushToast("success", "Senha redefinida com sucesso.");
  }

  const filteredItems = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((u) => {
      const matchSearch =
        !q || (u.nome ?? "").toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all" || (statusFilter === "active" ? !u.suspended : u.suspended);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });
  }, [items, roleFilter, search, statusFilter]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedItems = filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize);

  React.useEffect(() => {
    setPage(1);
  }, [search, statusFilter, roleFilter]);

  if (loading) {
    return <div className="text-sm text-zinc-500">Atualizando lista…</div>;
  }

  return (
    <div className="space-y-4">
      {error ? <FeedbackMessage type="error" message={error} onDismiss={() => setError(null)} /> : null}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? "Cancelar" : "Criar usuário"}
        </Button>
        <Button variant="secondary" size="sm" onClick={load}>
          Recarregar
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <Input
          placeholder="Buscar por nome ou email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "suspended")}
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="suspended">Suspensos</option>
        </Select>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as "all" | "ADMIN" | "USER")}>
          <option value="all">Todas as permissões</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </Select>
      </div>

      {showCreate ? (
        <form
          onSubmit={createUser}
          className="grid gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-2"
        >
          <Input
            placeholder="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
          <Input
            placeholder="Senha"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <Input placeholder="Nome" value={newUser.nome} onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })} />
          <Select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "USER" })}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </Select>
          <div className="sm:col-span-2">
            <Button type="submit" size="sm">
              Salvar usuário
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50/80 text-left text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
            <tr>
              <th className="p-3">Usuário</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Último acesso</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.map((u) => (
              <tr
                key={u.id}
                className="border-t border-zinc-200/80 transition-colors hover:bg-zinc-50/70 dark:border-zinc-800 dark:hover:bg-zinc-900/60"
              >
                <td className="p-3">
                  <div className="font-medium">{u.nome ?? u.email}</div>
                  <div className="text-xs text-zinc-500">{u.email}</div>
                  {!u.email_confirmed ? (
                    <div className="text-xs text-amber-600">Email não verificado</div>
                  ) : null}
                </td>
                <td className="p-3">
                  <div className="mb-1">
                    <StatusBadge tone={u.role === "ADMIN" ? "info" : "neutral"}>{u.role}</StatusBadge>
                  </div>
                  <Select value={u.role} onChange={(e) => updateRole(u.id, e.target.value as "ADMIN" | "USER")}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </Select>
                </td>
                <td className="p-3">
                  {u.suspended ? (
                    <StatusBadge tone="danger">Suspenso</StatusBadge>
                  ) : (
                    <StatusBadge tone="success">Ativo</StatusBadge>
                  )}
                </td>
                <td className="p-3 text-xs text-zinc-500">
                  {u.last_sign_in ? new Date(u.last_sign_in).toLocaleString("pt-BR") : "—"}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleSuspend(u.id, !u.suspended)}>
                      {u.suspended ? "Reativar" : "Suspender"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setResetUserId(u.id)}>
                      Resetar senha
                    </Button>
                  </div>
                  {resetUserId === u.id ? (
                    <div className="mt-2 flex gap-2">
                      <Input
                        type="password"
                        placeholder="Nova senha"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <Button size="sm" onClick={() => resetPassword(u.id)}>
                        Salvar
                      </Button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="surface-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm">
        <span className="text-zinc-500">
          {filteredItems.length} usuário(s) • página {safePage} de {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
