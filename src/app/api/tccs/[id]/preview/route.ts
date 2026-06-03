import { NextResponse } from "next/server";
import { createSupabaseDbClient } from "@/lib/supabase/db";

/** Serve o PDF na mesma origem para visualização inline (iframe no Android e desktop). */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createSupabaseDbClient();

  const { data: tcc } = await supabase.from("tccs").select("pdf_path").eq("id", id).maybeSingle();
  if (!tcc) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const { data: file, error } = await supabase.storage.from("tccs").download(tcc.pdf_path);
  if (error || !file) {
    return NextResponse.json({ error: error?.message ?? "Falha ao carregar PDF." }, { status: 500 });
  }

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="tcc-${id}.pdf"`,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
      // Permite leitura pelo visualizador PDF.js (fetch) se necessário no cliente.
      "Accept-Ranges": "bytes",
    },
  });
}
