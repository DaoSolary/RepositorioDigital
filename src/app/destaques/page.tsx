import { Container } from "@/components/Container";
import { AcervoHighlights } from "@/components/AcervoHighlights";

export default function DestaquesPage() {
  return (
    <main className="flex-1">
      <Container className="space-y-6 py-10">
        <div className="surface-card p-6">
          <h1 className="section-title text-3xl font-semibold tracking-tight">Destaques do acervo</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Rankings atualizados em tempo real com base nos trabalhos cadastrados no acervo.
          </p>
        </div>
        <AcervoHighlights />
      </Container>
    </main>
  );
}
