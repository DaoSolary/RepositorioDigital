import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchTccById } from "@/lib/tccs";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { FavoriteButton } from "@/components/FavoriteButton";
import { PdfViewer } from "@/components/PdfViewer";

export default async function TccDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tcc = await fetchTccById(id);
  if (!tcc) {
    return (
      <main className="flex-1">
        <Container className="py-10">
          <Card className="p-6">TCC não encontrado.</Card>
        </Container>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isFavorite = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("tcc_id", tcc.id)
      .maybeSingle();
    isFavorite = Boolean(fav);
  }

  return (
    <main className="flex-1">
      <Container className="py-10 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <Link href="/" className="text-sm text-zinc-500 hover:underline">
              ← Voltar
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{tcc.titulo}</h1>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {tcc.autor} • {tcc.curso} • {tcc.ano}
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Orientador: {tcc.orientador}</div>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <Link href={`/api/tccs/${tcc.id}/download`}>
              <Button size="sm">Baixar PDF</Button>
            </Link>
            <FavoriteButton tccId={tcc.id} initial={isFavorite} />
          </div>
        </div>

        <Card className="p-6">
          <div className="text-sm font-semibold">Resumo</div>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
            {tcc.resumo}
          </p>
          {tcc.palavras_chave?.length ? (
            <div className="mt-4 text-xs text-zinc-500">
              Palavras-chave: {tcc.palavras_chave.join(", ")}
            </div>
          ) : null}
        </Card>

        <div className="space-y-2">
          <div className="text-sm font-semibold">Visualização online</div>
          <PdfViewer tccId={tcc.id} />
        </div>
      </Container>
    </main>
  );
}

