import { Container } from "@/components/Container";
import { ResetPasswordClient } from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <main className="flex-1 bg-gradient-to-b from-zinc-50 to-zinc-100/60 dark:from-zinc-950 dark:to-zinc-900/40">
      <Container className="mx-auto max-w-md py-16">
        <ResetPasswordClient />
      </Container>
    </main>
  );
}
