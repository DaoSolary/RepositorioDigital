"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginInput = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(values: LoginInput) {
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "Falha ao entrar.");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="flex-1">
      <Container className="py-10">
        <div className="mx-auto max-w-md">
          <Card className="p-6">
            <h1 className="text-xl font-semibold">Entrar</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Acesso administrativo via email e senha (Supabase Auth).
            </p>

            <form className="mt-6 space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="mt-1">
                  <Input type="email" autoComplete="email" {...register("email")} />
                </div>
                {errors.email ? (
                  <div className="mt-1 text-xs text-red-600">{errors.email.message}</div>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium">Senha</label>
                <div className="mt-1">
                  <Input type="password" autoComplete="current-password" {...register("password")} />
                </div>
                {errors.password ? (
                  <div className="mt-1 text-xs text-red-600">{errors.password.message}</div>
                ) : null}
              </div>

              {error ? <div className="text-sm text-red-600">{error}</div> : null}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </main>
  );
}

