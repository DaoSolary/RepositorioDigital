"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
    const sp = new URLSearchParams(searchParams.toString());
    const setOrDelete = (k: string, v: string) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    };

    setOrDelete("q", dq.trim());
    setOrDelete("curso", curso);
    setOrDelete("ano", ano);
    sp.delete("page"); // reset pagina ao filtrar

    router.replace(`${pathname}?${sp.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq, curso, ano]);

  return (
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
  );
}

