"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Erro ao reenviar.");
      return;
    }
    setMessage(json.message || "Email reenviado.");
  }

  return (
    <main className="flex-1">
      <Container className="mx-auto max-w-md py-16">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">Verificação de email</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Confirme seu cadastro pelo link enviado ao email ou solicite um novo envio.
          </p>
          <form className="mt-6 space-y-3" onSubmit={resend}>
            <Input type="email" placeholder="Seu email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            {message ? <div className="text-sm text-emerald-600">{message}</div> : null}
            <Button type="submit" className="w-full">Reenviar email</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline">Voltar ao login</Link>
          </div>
        </Card>
      </Container>
    </main>
  );
}
