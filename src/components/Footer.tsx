import Link from "next/link";
import { Container } from "@/components/Container";
import { getCurrentRole } from "@/lib/auth";

const linkClass = "cursor-pointer hover:underline";

export async function Footer() {
  const role = await getCurrentRole();
  const isAdmin = role === "ADMIN";

  return (
    <footer className="mt-auto border-t border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <Container className="py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="text-sm font-semibold tracking-tight">Repositorio Digital</div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Repositório institucional de Trabalhos Académicos e Cientificos da Universidade Kimpa Vita.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Navegação</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/" className={linkClass}>Catálogo</Link></li>
              <li><Link href="/destaques" className={linkClass}>Destaques do acervo</Link></li>
              {isAdmin ? (
                <>
                  <li><Link href="/estatisticas" className={linkClass}>Estatísticas</Link></li>
                  <li><Link href="/api-docs" className={linkClass}>API Pública</Link></li>
                </>
              ) : null}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Conta</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/login" className={linkClass}>Entrar</Link></li>
              <li><Link href="/account/profile" className={linkClass}>Meu perfil</Link></li>
              <li><Link href="/account/favorites" className={linkClass}>Favoritos</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Institucional</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Universidade Kimpa Vita</li>
              <li>Suporte: adsutechcomservice@gmail.com</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} ADSU-TEC. Todos os direitos reservados.</span>
        </div>
      </Container>
    </footer>
  );
}
