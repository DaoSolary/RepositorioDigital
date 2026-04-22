import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DeleteTccButton } from "@/components/admin/DeleteTccButton";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: tccs, error } = await supabase
    .from("tccs")
    .select("id,titulo,autor,curso,ano,created_at,download_count")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <main className="flex-1">
      <Container className="py-10 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Gerencie o acervo de TCC.</p>
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
                      {t.autor} • {t.curso} • {t.ano} • Downloads: {t.download_count}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Link href={`/tcc/${t.id}`}>
                        <Button variant="secondary" size="sm">
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/admin/tccs/${t.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <DeleteTccButton id={t.id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}

