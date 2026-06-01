import { NextResponse } from "next/server";
import { TccBaseSchema } from "@/lib/validators/tcc";
import { assertAdmin } from "@/lib/admin";
import { env } from "@/lib/env";

export async function GET() {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const { data, error } = await supabase
    .from("tccs")
    .select("id,titulo,autor,curso,ano,created_at,download_count")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const { supabase, isAdmin } = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const form = await req.formData();
  const raw = {
    titulo: String(form.get("titulo") ?? ""),
    autor: String(form.get("autor") ?? ""),
    orientador: String(form.get("orientador") ?? ""),
    curso: String(form.get("curso") ?? ""),
    ano: String(form.get("ano") ?? ""),
    resumo: String(form.get("resumo") ?? ""),
    palavras_chave: String(form.get("palavras_chave") ?? ""),
  };

  const parsed = TccBaseSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const file = form.get("pdf");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "PDF obrigatório." }, { status: 400 });
  }

  const maxBytes = env.NEXT_PUBLIC_MAX_PDF_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `PDF excede ${env.NEXT_PUBLIC_MAX_PDF_MB}MB.` }, { status: 400 });
  }

  const type = file.type || "";
  if (type && type !== "application/pdf") {
    return NextResponse.json({ error: "Arquivo deve ser PDF." }, { status: 400 });
  }

  const pdfPath = `${crypto.randomUUID()}.pdf`;
  const upload = await supabase.storage.from("tccs").upload(pdfPath, file, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });

  const insert = await supabase.from("tccs").insert({
    ...parsed.data,
    palavras_chave: parsed.data.palavras_chave,
    pdf_path: pdfPath,
  }).select("id").single();

  if (insert.error) {
    await supabase.storage.from("tccs").remove([pdfPath]);
    return NextResponse.json({ error: insert.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: insert.data.id });
}

