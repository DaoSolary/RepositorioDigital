import { Container } from "@/components/Container";
import { getServerUser } from "@/lib/supabase/session";
import { ProfileClient } from "./ProfileClient";

/**
 * Autenticação de /account/* é feita no middleware.
 * Evita redirect() aqui (causa NEXT_REDIRECT no overlay de dev quando sessão falha momentaneamente).
 */
export default async function ProfilePage() {
  const user = await getServerUser();

  return (
    <main className="flex-1">
      <Container className="py-10 space-y-6">
        <div className="surface-card p-6">
          <h1 className="section-title text-3xl font-semibold tracking-tight">Meu perfil</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {user
              ? "Gerencie suas informações pessoais."
              : "Sessão não encontrada. Atualize a página ou faça login novamente."}
          </p>
        </div>
        {user ? <ProfileClient /> : null}
      </Container>
    </main>
  );
}
