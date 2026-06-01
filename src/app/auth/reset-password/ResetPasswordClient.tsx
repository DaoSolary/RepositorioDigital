"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { passwordSchema } from "@/lib/validators/auth";
import { msg } from "@/lib/validators/messages";

export function ResetPasswordClient() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [sessionReady, setSessionReady] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const [successOpen, setSuccessOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function establishRecoveryFromUrl(): Promise<boolean> {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const hashType = hash.get("type");

      if (accessToken && hashType === "recovery") {
        const res = await fetch("/api/auth/recovery-setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken }),
        });
        window.history.replaceState(null, "", window.location.pathname);
        if (res.ok) return true;
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? "Link inválido ou expirado.");
      }

      const code = params.get("code");
      if (code) {
        const res = await fetch("/api/auth/recovery-setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        window.history.replaceState(null, "", window.location.pathname);
        if (res.ok) return true;
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error ?? "Link inválido ou expirado.");
      }

      return false;
    }

    async function checkRecovery() {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get("error");
      if (errorParam) {
        if (!cancelled) {
          setError(errorParam);
          setChecking(false);
        }
        return;
      }

      try {
        const established = await establishRecoveryFromUrl();
        if (established) {
          if (!cancelled) {
            setSessionReady(true);
            setChecking(false);
          }
          return;
        }

        const res = await fetch("/api/auth/recovery-status", { cache: "no-store" });
        const json = (await res.json()) as { ready?: boolean };
        if (!cancelled) {
          if (json.ready) {
            setSessionReady(true);
          } else {
            setError(
              "Sessão não encontrada. Abra o link do email novamente ou solicite um novo email de recuperação.",
            );
          }
          setChecking(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível validar o link. Solicite um novo email de recuperação.",
          );
          setChecking(false);
        }
      }
    }

    void checkRecovery();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    setError(null);

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? msg.passwordMin);
      return;
    }

    if (password !== confirmPassword) {
      setFieldError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Não foi possível salvar a nova senha.");
      return;
    }

    setSuccessOpen(true);
  }

  function goToLogin() {
    setSuccessOpen(false);
    router.replace("/login?reset=ok");
    router.refresh();
  }

  if (checking) {
    return (
      <Card className="p-6 text-center text-sm text-zinc-500">
        Validando link de recuperação…
      </Card>
    );
  }

  if (!sessionReady) {
    return (
      <Card className="space-y-4 p-6">
        {error ? <FeedbackMessage type="error" message={error} onDismiss={() => setError(null)} /> : null}
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => router.push("/auth/forgot-password")}
        >
          Solicitar novo link
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-2xl border border-zinc-200/70 p-7 shadow-lg shadow-zinc-900/5 dark:border-zinc-800/80 dark:shadow-black/20">
        <h1 className="text-2xl font-semibold tracking-tight">Nova senha</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Defina uma nova senha para acessar o Acervo Digital de TCC.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Nova senha</label>
            <Input
              type="password"
              autoComplete="new-password"
              className="mt-1 h-11 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Confirmar senha</label>
            <Input
              type="password"
              autoComplete="new-password"
              className="mt-1 h-11 rounded-xl"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {fieldError ? <p className="text-sm text-red-600">{fieldError}</p> : null}
          {error ? <FeedbackMessage type="error" message={error} onDismiss={() => setError(null)} /> : null}
          <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </form>
      </Card>

      {successOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-base font-semibold">Senha redefinida</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Sua nova senha foi salva com sucesso. Agora entre com suas credenciais.
            </p>
            <div className="mt-5 flex justify-end">
              <Button type="button" size="sm" onClick={goToLogin}>
                Ir para login
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
