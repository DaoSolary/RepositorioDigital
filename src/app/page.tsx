import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { fetchFacets, fetchTccs } from "@/lib/tccs";
import { TccSearchFilters } from "@/components/TccSearchFilters";
import { Pagination } from "@/components/Pagination";
import { TopBanner } from "@/components/TopBanner";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const curso = typeof sp.curso === "string" ? sp.curso : undefined;
  const ano = typeof sp.ano === "string" ? Number(sp.ano) : undefined;
  const page = typeof sp.page === "string" ? Number(sp.page) : 1;

  const [tccResult, facets] = await Promise.all([
    fetchTccs({ q, curso, ano, page, pageSize: 10 }),
    fetchFacets(),
  ]);
  const { items, total, pageSize, error: dbError } = tccResult;

  return (
    <main className="flex-1">
      <TopBanner />

      <Container className="py-10">
        <div className="mb-4">
          <h1 className="section-title text-3xl font-semibold tracking-tight">Catálogo de TCCs</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Explore trabalhos por curso, ano e relevância acadêmica.
          </p>
        </div>

        {dbError ? (
          <Card className="mb-6 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <strong>Não foi possível conectar ao banco.</strong> Verifique o Supabase e o `.env.local`.
            Em redes com proxy no Windows, adicione <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">SUPABASE_INSECURE_SSL=1</code> (apenas dev).
            Detalhe: {dbError}
          </Card>
        ) : null}

        <div className="mt-6">
          <TccSearchFilters courses={facets.courses} years={facets.years} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          {items.length === 0 ? (
            <Card className="p-6">
              <div className="font-medium">Nenhum TCC encontrado</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Tente ajustar a busca ou os filtros.
              </div>
            </Card>
          ) : (
            items.map((t) => (
              <Card key={t.id} className="p-5 transition hover:-translate-y-0.5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link href={`/tcc/${t.id}`} className="text-lg font-semibold tracking-tight hover:underline">
                      {t.titulo}
                    </Link>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {t.autor} • {t.curso} • {t.ano}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Enviado em{" "}
                      {new Date(t.created_at).toLocaleDateString("pt-BR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                    Visualizações: {t.view_count} • Downloads: {t.download_count}
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {t.resumo}
                </p>
              </Card>
            ))
          )}
        </div>

        <div className="mt-6">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            basePath="/"
            searchParams={{
              q,
              curso,
              ano: ano ? String(ano) : undefined,
            }}
          />
        </div>
      </Container>
    </main>
  );
}
