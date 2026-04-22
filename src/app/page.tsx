import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { fetchFacets, fetchTccs } from "@/lib/tccs";
import { TccSearchFilters } from "@/components/TccSearchFilters";
import { Pagination } from "@/components/Pagination";

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

  const [{ items, total, pageSize }, facets] = await Promise.all([
    fetchTccs({ q, curso, ano, page, pageSize: 10 }),
    fetchFacets(),
  ]);

  return (
    <main className="flex-1">
      <Container className="py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Acervo Digital de TCC</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Pesquise e visualize Trabalhos de Conclusão de Curso disponíveis no acervo.
          </p>
        </div>

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
              <Card key={t.id} className="p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link href={`/tcc/${t.id}`} className="text-lg font-semibold hover:underline">
                      {t.titulo}
                    </Link>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {t.autor} • {t.curso} • {t.ano}
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">Downloads: {t.download_count}</div>
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
