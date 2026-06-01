import { NextResponse } from "next/server";
import { TccBaseSchema } from "@/lib/validators/tcc";
import { assertAdmin } from "@/lib/admin";
import { env } from "@/lib/env";
import { writeAudit, recordTccHistory } from "@/lib/audit";
import { logActivity } from "@/lib/activity";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, isAdmin, user } = await assertAdmin();
  if (!isAdmin || !user) return NextResponse.json({ error: "Proibido." }, { status: 403 });

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

  const { data: existing } = await supabase
    .from("tccs")
    .select("pdf_path")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const maybeFile = form.get("pdf");
  let newPdfPath: string | null = null;

  if (maybeFile instanceof Blob && maybeFile.size > 0) {
    const maxBytes = env.NEXT_PUBLIC_MAX_PDF_MB * 1024 * 1024;
    if (maybeFile.size > maxBytes) {
      return NextResponse.json({ error: `PDF excede ${env.NEXT_PUBLIC_MAX_PDF_MB}MB.` }, { status: 400 });
    }
    const type = maybeFile.type || "";
    if (type && type !== "application/pdf") {
      return NextResponse.json({ error: "Arquivo deve ser PDF." }, { status: 400 });
    }

    newPdfPath = `${crypto.randomUUID()}.pdf`;
    const upload = await supabase.storage.from("tccs").upload(newPdfPath, maybeFile, {
      contentType: "application/pdf",
      upsert: false,
    });
    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }

  const update = await supabase
    .from("tccs")
    .update({
      ...parsed.data,
      palavras_chave: parsed.data.palavras_chave,
      ...(newPdfPath ? { pdf_path: newPdfPath } : {}),
    })
    .eq("id", id);

  if (update.error) {
    if (newPdfPath) await supabase.storage.from("tccs").remove([newPdfPath]);
    return NextResponse.json({ error: update.error.message }, { status: 500 });
  }

  if (newPdfPath) {
    await supabase.storage.from("tccs").remove([existing.pdf_path]);
  }

  await recordTccHistory({ tccId: id, changedBy: user.id, action: "update", snapshot: parsed.data }).catch(() => null);
  await writeAudit({ actorId: user.id, action: "update", tableName: "tccs", recordId: id, newData: parsed.data }).catch(() => null);
  await logActivity({ userId: user.id, action: "admin_update_tcc", resourceType: "tcc", resourceId: id }).catch(() => null);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, isAdmin, user } = await assertAdmin();
  if (!isAdmin || !user) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const { data: existing } = await supabase
    .from("tccs")
    .select("pdf_path")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const del = await supabase.from("tccs").delete().eq("id", id);
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

  await supabase.storage.from("tccs").remove([existing.pdf_path]);
  await recordTccHistory({ tccId: id, changedBy: user.id, action: "delete", snapshot: { pdf_path: existing.pdf_path } }).catch(() => null);
  await writeAudit({ actorId: user.id, action: "delete", tableName: "tccs", recordId: id }).catch(() => null);
  await logActivity({ userId: user.id, action: "admin_delete_tcc", resourceType: "tcc", resourceId: id }).catch(() => null);
  return NextResponse.json({ ok: true });
}

