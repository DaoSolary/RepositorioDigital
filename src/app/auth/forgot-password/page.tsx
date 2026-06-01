"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error || "Erro ao enviar email.");
      return;
    }
    setMessage(json.message);
  }

  return (
    <main className="flex-1 bg-gradient-to-b from-zinc-50 to-zinc-100/60 dark:from-zinc-950 dark:to-zinc-900/40">
      <Container className="mx-auto max-w-md py-16">
        <Card className="rounded-2xl border border-zinc-200/70 p-7 shadow-lg shadow-zinc-900/5 dark:border-zinc-800/80 dark:shadow-black/20">
          <h1 className="text-2xl font-semibold tracking-tight">Recuperar senha</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Enviaremos um link para redefinir sua senha.
          </p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Input
              type="email"
              placeholder="Seu email"
              className="h-11 rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error ? <FeedbackMessage type="error" message={error} onDismiss={() => setError(null)} /> : null}
            {message ? <FeedbackMessage type="success" message={message} onDismiss={() => setMessage(null)} /> : null}
            <Button type="submit" className="h-11 w-full rounded-xl" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline">Voltar ao login</Link>
          </div>
        </Card>
      </Container>
    </main>
  );
}
