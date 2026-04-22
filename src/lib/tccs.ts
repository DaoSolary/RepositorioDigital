import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TccRow = {
  id: string;
  titulo: string;
  autor: string;
  orientador: string;
  curso: string;
  ano: number;
  resumo: string;
  palavras_chave: string[];
  pdf_path: string;
  download_count: number;
  created_at: string;
};

export async function fetchTccs(params: {
  q?: string;
  curso?: string;
  ano?: number;
  page?: number;
  pageSize?: number;
}) {
  const { q, curso, ano } = params;
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("tccs")
    .select(
      "id,titulo,autor,orientador,curso,ano,resumo,palavras_chave,pdf_path,download_count,created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (curso) query = query.eq("curso", curso);
  if (ano) query = query.eq("ano", ano);
  if (q && q.trim()) {
    const s = q.trim();
    query = query.or(`titulo.ilike.%${s}%,autor.ilike.%${s}%,orientador.ilike.%${s}%`);
  }

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  return {
    items: (data ?? []) as TccRow[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function fetchTccById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tccs")
    .select(
      "id,titulo,autor,orientador,curso,ano,resumo,palavras_chave,pdf_path,download_count,created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as TccRow | null;
}

export async function fetchFacets() {
  const supabase = await createSupabaseServerClient();

  const { data: courses } = await supabase.from("tccs").select("curso");
  const { data: years } = await supabase.from("tccs").select("ano");

  const uniqueCourses = Array.from(new Set((courses ?? []).map((r) => r.curso).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );
  const uniqueYears = Array.from(new Set((years ?? []).map((r) => r.ano).filter(Boolean))).sort(
    (a, b) => b - a,
  );

  return { courses: uniqueCourses, years: uniqueYears };
}

