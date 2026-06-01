import { createSupabaseDbClient } from "@/lib/supabase/db";

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
  view_count: number;
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

  const supabase = createSupabaseDbClient();

  let query = supabase
    .from("tccs")
    .select(
      "id,titulo,autor,orientador,curso,ano,resumo,palavras_chave,pdf_path,download_count,view_count,created_at",
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
  if (error) {
    console.error("fetchTccs error:", error.message);
    return { items: [], total: 0, page, pageSize, error: error.message };
  }

  return {
    items: (data ?? []) as TccRow[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function fetchTccById(id: string) {
  const supabase = createSupabaseDbClient();
  const { data, error } = await supabase
    .from("tccs")
    .select(
      "id,titulo,autor,orientador,curso,ano,resumo,palavras_chave,pdf_path,download_count,view_count,created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as TccRow | null;
}

export async function fetchFacets() {
  const supabase = createSupabaseDbClient();

  const { data: courses, error: courseError } = await supabase
    .from("tccs")
    .select("curso");

  if (courseError) {
    console.error("COURSE ERROR:", courseError);
    return { courses: [], years: [] };
  }

  const { data: years, error: yearError } = await supabase
    .from("tccs")
    .select("ano");

  if (yearError) {
    console.error("YEAR ERROR:", yearError);
    return { courses: [], years: [] };
  }

  const uniqueCourses = Array.from(
    new Set((courses ?? []).map((r) => r.curso).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const uniqueYears = Array.from(
    new Set((years ?? []).map((r) => r.ano).filter(Boolean))
  ).sort((a, b) => b - a);

  return { courses: uniqueCourses, years: uniqueYears };
}

export type PublicTcc = Omit<TccRow, "pdf_path">;

export function toPublicTcc({ pdf_path, ...rest }: TccRow): PublicTcc {
  void pdf_path;
  return rest;
}

