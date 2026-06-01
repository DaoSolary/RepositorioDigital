import Link from "next/link";
import { Card } from "@/components/ui/card";
import { fetchAcervoHighlights } from "@/lib/stats";

function EmptyBlock({ text }: { text: string }) {
  return <p className="mt-4 text-sm text-zinc-500">{text}</p>;
}

export async function AcervoHighlights() {
  const stats = await fetchAcervoHighlights();
  const hasData =
    stats.mostViewed.length > 0 ||
    stats.mostDownloaded.length > 0 ||
    stats.featuredAuthors.length > 0 ||
    stats.trendingCourses.length > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="p-5">
        <h3 className="section-title text-base font-semibold">Mais vistos</h3>
        {stats.mostViewed.length === 0 ? (
          <EmptyBlock text="Nenhum trabalho com visualizações registradas." />
        ) : (
          <ul className="mt-4 space-y-3">
            {stats.mostViewed.map((t, i) => (
              <li key={t.id} className="flex items-start gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-800">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <Link href={`/tcc/${t.id}`} className="font-medium hover:underline line-clamp-2">
                    {t.titulo}
                  </Link>
                  <div className="text-xs text-zinc-500">
                    {t.autor} • {t.curso} • {t.view_count} visualizações
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="section-title text-base font-semibold">Mais baixados</h3>
        {stats.mostDownloaded.length === 0 ? (
          <EmptyBlock text="Nenhum trabalho com downloads registrados." />
        ) : (
          <ul className="mt-4 space-y-3">
            {stats.mostDownloaded.map((t, i) => (
              <li key={t.id} className="flex items-start gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold dark:bg-zinc-800">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <Link href={`/tcc/${t.id}`} className="font-medium hover:underline line-clamp-2">
                    {t.titulo}
                  </Link>
                  <div className="text-xs text-zinc-500">
                    {t.autor} • {t.curso} • {t.download_count} downloads
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="section-title text-base font-semibold">Autores em destaque</h3>
        {stats.featuredAuthors.length === 0 ? (
          <EmptyBlock text="Sem dados de autores no acervo." />
        ) : (
          <ul className="mt-4 space-y-2">
            {stats.featuredAuthors.map((a) => (
              <li key={a.autor} className="flex justify-between gap-2 text-sm">
                <span>{a.autor}</span>
                <span className="shrink-0 text-zinc-500">
                  {a.total} trabalho(s) • {a.views} views
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5">
        <h3 className="section-title text-base font-semibold">Áreas em alta</h3>
        {stats.trendingCourses.length === 0 ? (
          <EmptyBlock text="Sem dados por curso no acervo." />
        ) : (
          <ul className="mt-4 space-y-2">
            {stats.trendingCourses.map((c) => (
              <li key={c.curso} className="flex justify-between gap-2 text-sm">
                <span>{c.curso}</span>
                <span className="shrink-0 text-zinc-500">
                  {c.total} TCC(s) • {c.views} views • {c.downloads} downloads
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {!hasData ? (
        <p className="lg:col-span-2 text-center text-sm text-zinc-500">
          O acervo ainda não possui trabalhos cadastrados. Os destaques aparecerão automaticamente conforme os TCCs forem publicados.
        </p>
      ) : null}
    </div>
  );
}
