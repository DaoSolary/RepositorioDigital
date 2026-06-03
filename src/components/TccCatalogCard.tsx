import Link from "next/link";
import { Card } from "@/components/ui/card";

export type TccCatalogItem = {
  id: string;
  titulo: string;
  autor: string;
  curso: string;
  ano: number;
  created_at: string;
  view_count: number;
  download_count: number;
  resumo: string;
};

/** Card inteiro clicável — melhora toque em telemóveis (Android/iOS). */
export function TccCatalogCard({ t }: { t: TccCatalogItem }) {
  return (
    <Link
      href={`/tcc/${t.id}`}
      prefetch
      className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:focus-visible:outline-zinc-500"
    >
      <Card className="p-5 transition hover:-translate-y-0.5 active:scale-[0.998]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-tight group-hover:underline">{t.titulo}</div>
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
        <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{t.resumo}</p>
      </Card>
    </Link>
  );
}
