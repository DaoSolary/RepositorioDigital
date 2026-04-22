import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: tcc } = await supabase.from("tccs").select("pdf_path").eq("id", id).maybeSingle();
  if (!tcc) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const { data, error } = await supabase.storage
    .from("tccs")
    .createSignedUrl(tcc.pdf_path, 60 * 10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ url: data.signedUrl });
}

