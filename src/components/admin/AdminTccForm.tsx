"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const FormSchema = z.object({
  titulo: z.string().min(3),
  autor: z.string().min(3),
  orientador: z.string().min(3),
  curso: z.string().min(2),
  ano: z.coerce.number().int().min(1900).max(2100),
  resumo: z.string().min(10),
  palavras_chave: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function AdminTccForm({
  mode,
  id,
  initialValues,
}: {
  mode: "create" | "edit";
  id?: string;
  initialValues?: Partial<FormValues> & { palavras_chave?: string };
}) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: initialValues,
  });

  const fileRef = React.useRef<HTMLInputElement | null>(null);

  async function onSubmit(values: FormValues) {
    setError(null);
    setFieldErrors({});

    const parsed = FormSchema.safeParse(values);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fe[key]) fe[key] = issue.message;
      }
      setFieldErrors(fe);
      return;
    }

    const fd = new FormData();
    for (const [k, v] of Object.entries(parsed.data)) {
      fd.set(k, String(v ?? ""));
    }

    const file = fileRef.current?.files?.[0] ?? null;
    if (mode === "create" && !file) {
      setError("Selecione um PDF.");
      return;
    }
    if (file) fd.set("pdf", file);

    const url = mode === "create" ? "/api/admin/tccs" : `/api/admin/tccs/${id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, { method, body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error || "Falha ao salvar.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Título</label>
          <div className="mt-1">
            <Input {...register("titulo")} />
          </div>
          {fieldErrors.titulo ? <div className="mt-1 text-xs text-red-600">{fieldErrors.titulo}</div> : null}
        </div>
        <div>
          <label className="text-sm font-medium">Autor</label>
          <div className="mt-1">
            <Input {...register("autor")} />
          </div>
          {fieldErrors.autor ? <div className="mt-1 text-xs text-red-600">{fieldErrors.autor}</div> : null}
        </div>
        <div>
          <label className="text-sm font-medium">Orientador</label>
          <div className="mt-1">
            <Input {...register("orientador")} />
          </div>
          {fieldErrors.orientador ? <div className="mt-1 text-xs text-red-600">{fieldErrors.orientador}</div> : null}
        </div>
        <div>
          <label className="text-sm font-medium">Curso</label>
          <div className="mt-1">
            <Input {...register("curso")} />
          </div>
          {fieldErrors.curso ? <div className="mt-1 text-xs text-red-600">{fieldErrors.curso}</div> : null}
        </div>
        <div>
          <label className="text-sm font-medium">Ano</label>
          <div className="mt-1">
            <Input type="number" {...register("ano", { valueAsNumber: true })} />
          </div>
          {fieldErrors.ano ? <div className="mt-1 text-xs text-red-600">{fieldErrors.ano}</div> : null}
        </div>
        <div>
          <label className="text-sm font-medium">Palavras-chave (separadas por vírgula)</label>
          <div className="mt-1">
            <Input {...register("palavras_chave")} placeholder="ex: IA, educação, redes neurais" />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Resumo</label>
        <div className="mt-1">
          <Textarea {...register("resumo")} />
        </div>
        {fieldErrors.resumo ? <div className="mt-1 text-xs text-red-600">{fieldErrors.resumo}</div> : null}
      </div>

      <div>
        <label className="text-sm font-medium">
          PDF {mode === "create" ? "(obrigatório)" : "(opcional)"}
        </label>
        <div className="mt-1">
          <input ref={fileRef} type="file" accept="application/pdf" />
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

