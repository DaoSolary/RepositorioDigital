import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { getServerAuth } from "@/lib/supabase/session";

export default async function FavoritesPage() {
  const { supabase, user } = await getServerAuth();
  const { data: favorites } = user
    ? await supabase
    .from("favorites")
    .select("tcc_id, created_at, tccs(id,titulo,autor,curso,ano)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <main className="flex-1">
      <Container className="py-10 space-y-6">
        <div className="surface-card p-6">
          <h1 className="section-title text-3xl font-semibold tracking-tight">Meus favoritos</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Trabalhos que você salvou para consulta posterior.</p>
        </div>

        <div className="grid gap-3">
          {(favorites ?? []).length === 0 ? (
            <Card className="p-6 text-sm text-zinc-500">Nenhum favorito ainda.</Card>
          ) : (
            favorites?.map((f) => {
              const raw = f.tccs as { id: string; titulo: string; autor: string; curso: string; ano: number } | { id: string; titulo: string; autor: string; curso: string; ano: number }[] | null;
              const tcc = Array.isArray(raw) ? raw[0] : raw;
              if (!tcc) return null;
              return (
                <Card key={f.tcc_id} className="p-5 transition hover:-translate-y-0.5">
                  <Link href={`/tcc/${tcc.id}`} className="text-lg font-semibold hover:underline">
                    {tcc.titulo}
                  </Link>
                  <div className="mt-1 text-sm text-zinc-500">{tcc.autor} • {tcc.curso} • {tcc.ano}</div>
                </Card>
              );
            })
          )}
        </div>
      </Container>
    </main>
  );
}
