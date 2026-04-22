import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";

export async function Header() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role =
    user
      ? (
          await supabase
            .from("roles")
            .select("role")
            .eq("user_id", user.id)
            .maybeSingle()
        ).data?.role
      : null;

  return (
    <header className="border-b border-zinc-200 bg-white/75 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/60">
      <Container className="flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">
            Acervo de TCC
          </Link>
          <span className="text-xs text-zinc-500">Instituição</span>
        </div>
        <nav className="flex items-center gap-2">
          {role === "ADMIN" ? (
            <Link href="/admin">
              <Button variant="secondary" size="sm">
                Admin
              </Button>
            </Link>
          ) : null}

          {user ? (
            <form action="/api/auth/logout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                Sair
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
        </nav>
      </Container>
    </header>
  );
}

