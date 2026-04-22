import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { AdminTccForm } from "@/components/admin/AdminTccForm";
import { fetchTccById } from "@/lib/tccs";

export default async function EditTccPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tcc = await fetchTccById(id);
  if (!tcc) return notFound();

  return (
    <main className="flex-1">
      <Container className="py-10">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">Editar TCC</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Atualize os metadados e, se necessário, envie um novo PDF.
          </p>
          <div className="mt-6">
            <AdminTccForm
              mode="edit"
              id={id}
              initialValues={{
                titulo: tcc.titulo,
                autor: tcc.autor,
                orientador: tcc.orientador,
                curso: tcc.curso,
                ano: tcc.ano,
                resumo: tcc.resumo,
                palavras_chave: (tcc.palavras_chave ?? []).join(", "),
              }}
            />
          </div>
        </Card>
      </Container>
    </main>
  );
}

