import { NextResponse } from "next/server";
import { createSupabaseDbClient } from "@/lib/supabase/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseDbClient();

  // incrementa contador (best-effort)
  await supabase.rpc("increment_tcc_download", { p_tcc_id: id });

  const { data: tcc } = await supabase.from("tccs").select("pdf_path").eq("id", id).maybeSingle();
  if (!tcc) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("tccs")
    .createSignedUrl(tcc.pdf_path, 60 * 30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}

