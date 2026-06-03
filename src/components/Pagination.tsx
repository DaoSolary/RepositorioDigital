import Link from "next/link";
import { cn } from "@/lib/ui/cn";

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  const makeHref = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v) sp.set(k, v);
    }
    if (p > 1) sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const navBtnClass =
    "inline-flex h-9 min-w-[4.5rem] cursor-pointer items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800";

  return (
    <div className="surface-card flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
      <div className="text-sm text-zinc-500">
        Página {page} de {totalPages} • {total} resultados
      </div>
      <div className="flex items-center gap-2">
        {page === 1 ? (
          <span
            aria-disabled
            className={cn(navBtnClass, "pointer-events-none cursor-not-allowed opacity-50")}
          >
            Anterior
          </span>
        ) : (
          <Link href={makeHref(prev)} className={navBtnClass}>
            Anterior
          </Link>
        )}
        {page === totalPages ? (
          <span
            aria-disabled
            className={cn(navBtnClass, "pointer-events-none cursor-not-allowed opacity-50")}
          >
            Próxima
          </span>
        ) : (
          <Link href={makeHref(next)} className={navBtnClass}>
            Próxima
          </Link>
        )}
      </div>
    </div>
  );
}

