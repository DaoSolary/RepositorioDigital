import { Container } from "@/components/Container";

export function TopBanner() {
  return (
    <div className="relative overflow-hidden border-b border-zinc-200/60 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:border-zinc-800/70 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-200/40 via-transparent to-transparent dark:from-zinc-800/30" />
      <Container className="relative py-10">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Universidade Kimpa Vita</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Repositorio Académico e Cientifico</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Pesquise, visualize e faça download de trabalhos Académico e Cientifico.
            </p>
          </div>

          <div className="w-full sm:w-[320px]">
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <img
                src="/unikivi%20(2).jfif"
                alt="Identidade visual"
                className="h-28 w-full object-cover sm:h-24"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

