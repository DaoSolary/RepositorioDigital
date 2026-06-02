import Link from "next/link";
import { getHeaderAuth } from "@/lib/auth";
import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";

const navLinkClass =
  "cursor-pointer rounded-md px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900";

export async function Header() {
  let user: { id: string; email?: string } | null = null;
  let role: string | null = null;
  let profileName: string | null = null;

  try {
    const auth = await getHeaderAuth();
    user = auth.user;
    role = auth.role;
    profileName = auth.profileName;
  } catch {
    // Header continua funcionando mesmo se Supabase estiver indisponível
  }

  const isAdmin = role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90">
      <Container className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex cursor-pointer items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              <img
                src="/unikivi%20(2).jfif"
                alt="Universidade Kimpa Vita"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">Acervo Digital de TCC</div>
              <div className="text-[11px] text-zinc-500">Universidade Kimpa Vita</div>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className={navLinkClass}>
            Catálogo
          </Link>
          <Link href="/destaques" className={navLinkClass}>
            Destaques do acervo
          </Link>
          {isAdmin ? (
            <>
              <Link href="/estatisticas" className={navLinkClass} prefetch={false}>
                Estatísticas
              </Link>
              <Link href="/api-docs" className={navLinkClass} prefetch={false}>
                API
              </Link>
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Link href="/admin" className="hidden cursor-pointer sm:block" prefetch={false}>
              <Button variant="secondary" size="sm">
                Admin
              </Button>
            </Link>
          ) : null}

          {user ? (
            <>
              <Link href="/account/favorites" className="hidden cursor-pointer sm:block" prefetch={false}>
                <Button variant="ghost" size="sm">
                  Favoritos
                </Button>
              </Link>
              <Link href="/account/profile" className="cursor-pointer" prefetch={false}>
                <Button variant="ghost" size="sm">
                  {profileName ?? "Perfil"}
                </Button>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="cursor-pointer">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}
