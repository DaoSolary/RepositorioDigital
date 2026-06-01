import { Container } from "@/components/Container";
import { Suspense } from "react";
import { LoginClient } from "@/app/login/LoginClient";

export default function LoginPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-zinc-50 to-zinc-100/60 dark:from-zinc-950 dark:to-zinc-900/40">
      <Container className="py-12">
        <div className="mx-auto max-w-md">
          <Suspense fallback={<div className="text-sm text-zinc-500">Carregando…</div>}>
            <LoginClient />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}

