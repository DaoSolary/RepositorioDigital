import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const QuerySchema = z.object({
  q: z.string().optional(),
  curso: z.string().optional(),
  ano: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const { q, curso, ano, page, pageSize } = parsed.data;
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
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    items: data ?? [],
    page,
    pageSize,
    total: count ?? 0,
  });
}

