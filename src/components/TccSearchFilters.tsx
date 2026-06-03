"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export function TccSearchFilters({
  courses,
  years,
}: {
  courses: string[];
  years: number[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = React.useState(searchParams.get("q") ?? "");
  const [curso, setCurso] = React.useState(searchParams.get("curso") ?? "");
  const [ano, setAno] = React.useState(searchParams.get("ano") ?? "");

  const dq = useDebouncedValue(q, 350);

  React.useEffect(() => {
    const sp = new URLSearchParams();
    const trimmedQ = dq.trim();
    if (trimmedQ) sp.set("q", trimmedQ);
    if (curso) sp.set("curso", curso);
    if (ano) sp.set("ano", ano);

    const nextFilters = sp.toString();
    const current = new URLSearchParams(searchParams.toString());
    current.delete("page");
    const currentFilters = current.toString();
    const filtersChanged = nextFilters !== currentFilters;

    if (!filtersChanged && !searchParams.has("page")) return;

    const href = nextFilters ? `${pathname}?${nextFilters}` : pathname;
    const currentHref = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    if (href === currentHref) return;

    router.replace(href);
  }, [dq, curso, ano, pathname, router, searchParams]);

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3">
        <h2 className="section-title text-base font-semibold">Buscar trabalhos</h2>
        <p className="text-xs text-zinc-500">Filtre por título, curso ou ano de publicação.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, autor, palavras-chave..."
          />
        </div>
        <Select value={curso} onChange={(e) => setCurso(e.target.value)}>
          <option value="">Todos os cursos</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={ano} onChange={(e) => setAno(e.target.value)}>
          <option value="">Todos os anos</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </Select>
      </div>
    </Card>
  );
}

