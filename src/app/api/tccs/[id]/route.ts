import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: tcc, error } = await supabase
    .from("tccs")
    .select(
      "id,titulo,autor,orientador,curso,ano,resumo,palavras_chave,pdf_path,download_count,created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!tcc) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isFavorite = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("tcc_id", tcc.id)
      .maybeSingle();
    isFavorite = Boolean(fav);
  }

  return NextResponse.json({ tcc, isFavorite });
}

