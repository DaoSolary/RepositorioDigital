import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseDbClient } from "@/lib/supabase/db";
import { DeleteTccButton } from "@/components/admin/DeleteTccButton";

export default async function AdminTccsPage() {
  const supabase = createSupabaseDbClient();
  const { data: tccs, error } = await supabase
    .from("tccs")
    .select("id,titulo,autor,curso,ano,created_at,download_count,view_count")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Gestão de trabalhos</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Upload, edição e exclusão de TCCs.</p>
        </div>
        <Link href="/admin/tccs/new">
          <Button>Novo TCC</Button>
        </Link>
      </div>

      {error ? (
        <Card className="p-6">Erro ao carregar: {error.message}</Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {(tccs ?? []).map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-base font-semibold">{t.titulo}</div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {t.autor} • {t.curso} • {t.ano} • Visualizações: {t.view_count} • Downloads: {t.download_count}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Link href={`/tcc/${t.id}`}>
                      <Button variant="secondary" size="sm">Ver</Button>
                    </Link>
                    <Link href={`/admin/tccs/${t.id}/edit`}>
                      <Button variant="secondary" size="sm">Editar</Button>
                    </Link>
                  </div>
                </div>
                <DeleteTccButton id={t.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
