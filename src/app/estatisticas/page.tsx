import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { getCurrentRole } from "@/lib/auth";
import { fetchPublicStats } from "@/lib/stats";

export default async function EstatisticasPage() {
  const role = await getCurrentRole();
  if (role !== "ADMIN") redirect("/");

  const stats = await fetchPublicStats();

  return (
    <main className="flex-1">
      <Container className="space-y-8 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Estatísticas do Repositório</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Painel administrativo com indicadores Estatísticos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Trabalhos cadastrados</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">{stats.totalTccs}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Total de visualizações</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">{stats.totalViews}</div>
          </Card>
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Total de downloads</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">{stats.totalDownloads}</div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="font-semibold">Mais vistos</h2>
            {stats.mostViewed.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">Sem dados.</p>
            ) : (
              <>
                <div className="mt-4">
                  <SimpleBarChart
                    items={stats.mostViewed.map((t) => ({
                      label: t.titulo.slice(0, 36),
                      value: t.view_count,
                    }))}
                  />
                </div>
                <ul className="mt-4 space-y-2">
                  {stats.mostViewed.map((t) => (
                    <li key={t.id} className="text-sm">
                      <Link href={`/tcc/${t.id}`} className="hover:underline">
                        {t.titulo}
                      </Link>
                      <span className="text-zinc-500"> — {t.view_count} views</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">Mais baixados</h2>
            {stats.mostDownloaded.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">Sem dados.</p>
            ) : (
              <div className="mt-4">
                <SimpleBarChart
                  items={stats.mostDownloaded.map((t) => ({
                    label: t.titulo.slice(0, 36),
                    value: t.download_count,
                  }))}
                />
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">Autores em destaque</h2>
            {stats.featuredAuthors.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">Sem dados.</p>
            ) : (
              <div className="mt-4">
                <SimpleBarChart
                  items={stats.featuredAuthors.map((a) => ({ label: a.autor, value: a.views }))}
                />
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold">Cursos mais acessados</h2>
            {stats.trendingCourses.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">Sem dados.</p>
            ) : (
              <div className="mt-4">
                <SimpleBarChart
                  items={stats.trendingCourses.map((c) => ({ label: c.curso, value: c.views }))}
                />
              </div>
            )}
          </Card>
        </div>

        {stats.recentTccs.length > 0 ? (
          <Card className="p-5">
            <h2 className="font-semibold">Trabalhos recentes</h2>
            <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {stats.recentTccs.map((t) => (
                <li key={t.id} className="flex justify-between gap-2 py-3 text-sm">
                  <Link href={`/tcc/${t.id}`} className="font-medium hover:underline">
                    {t.titulo}
                  </Link>
                  <span className="text-zinc-500">
                    {new Date(t.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </Container>
    </main>
  );
}
