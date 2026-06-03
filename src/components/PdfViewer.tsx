"use client";

import * as React from "react";

export function PdfViewer({ tccId }: { tccId: string }) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/tccs/${tccId}/signed-url`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Falha ao carregar PDF.");
        if (!cancelled) setUrl(json.url);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar PDF.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tccId]);

  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!url) return <div className="text-sm text-zinc-500">Carregando PDF…</div>;

  return (
    <div className="space-y-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800 sm:hidden"
      >
        Abrir PDF no navegador
      </a>
      <iframe
        title="Visualizador de PDF"
        src={url}
        className="h-[60vh] w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 sm:h-[70vh]"
      />
    </div>
  );
}

