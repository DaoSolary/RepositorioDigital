"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { loginSchema } from "@/lib/validators/auth";
import { safeRedirectPath } from "@/lib/security/safe-redirect";
import { z } from "zod";

type AuthInput = z.infer<typeof loginSchema>;

export function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeRedirectPath(sp.get("next"));
  const resetOk = sp.get("reset") === "ok";
  const [mode, setMode] = React.useState<"login" | "signup">("login");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthInput>({ resolver: zodResolver(loginSchema) });

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (resetOk) {
      setSuccess("Senha redefinida com sucesso. Faça login com a nova senha.");
    }
  }, [resetOk]);

  React.useEffect(() => {
    setError(null);
    if (!resetOk) setSuccess(null);
  }, [mode, resetOk]);

  async function onSubmit(values: AuthInput) {
    setError(null);
    setSuccess(null);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "Falha ao autenticar.");
      return;
    }
    if (mode === "signup" && json.needsEmailConfirmation) {
      setSuccess(json.message || "Verifique seu email para confirmar o cadastro.");
      return;
    }
    router.replace(mode === "login" ? next : "/account/profile");
    router.refresh();
  }

  return (
    <Card className="rounded-2xl border border-zinc-200/70 p-7 shadow-lg shadow-zinc-900/5 dark:border-zinc-800/80 dark:shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{mode === "login" ? "Entrar" : "Criar conta"}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {mode === "login"
              ? "Acesse o acervo com email e senha."
              : "Cadastre-se para favoritar trabalhos e gerenciar seu perfil."}
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <Button type="button" size="sm" variant={mode === "login" ? "secondary" : "ghost"} onClick={() => setMode("login")}>
            Login
          </Button>
          <Button type="button" size="sm" variant={mode === "signup" ? "secondary" : "ghost"} onClick={() => setMode("signup")}>
            Cadastro
          </Button>
        </div>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Email</label>
          <div className="mt-1">
            <Input type="email" autoComplete="email" className="h-11 rounded-xl" {...register("email")} />
          </div>
          {errors.email ? <div className="mt-1 text-xs text-red-600">{errors.email.message}</div> : null}
        </div>

        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Senha</label>
          <div className="mt-1">
            <Input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="h-11 rounded-xl"
              {...register("password")}
            />
          </div>
          {errors.password ? (
            <div className="mt-1 text-xs text-red-600">{errors.password.message}</div>
          ) : null}
        </div>

        {error ? <FeedbackMessage type="error" message={error} onDismiss={() => setError(null)} /> : null}
        {success ? <FeedbackMessage type="success" message={success} onDismiss={() => setSuccess(null)} /> : null}

        <Button type="submit" disabled={isSubmitting} className="h-11 w-full rounded-xl">
          {isSubmitting ? (mode === "login" ? "Entrando..." : "Criando...") : mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
      </form>

      {mode === "login" ? (
        <div className="mt-5 space-y-2 text-center text-xs text-zinc-500">
          <div>
            <Link href="/auth/forgot-password" className="cursor-pointer underline">
              Esqueci minha senha
            </Link>
          </div>
          <div>
            <Link href="/auth/verify-email" className="cursor-pointer underline">
              Reenviar verificação de email
            </Link>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
