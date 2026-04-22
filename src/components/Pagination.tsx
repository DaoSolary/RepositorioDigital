import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-zinc-500">
        Página {page} de {totalPages} • {total} resultados
      </div>
      <div className="flex items-center gap-2">
        <Link href={makeHref(prev)} aria-disabled={page === 1}>
          <Button variant="secondary" size="sm" disabled={page === 1}>
            Anterior
          </Button>
        </Link>
        <Link href={makeHref(next)} aria-disabled={page === totalPages}>
          <Button variant="secondary" size="sm" disabled={page === totalPages}>
            Próxima
          </Button>
        </Link>
      </div>
    </div>
  );
}

