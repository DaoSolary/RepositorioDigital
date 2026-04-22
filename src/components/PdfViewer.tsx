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
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Erro ao carregar PDF.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tccId]);

  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (!url) return <div className="text-sm text-zinc-500">Carregando PDF…</div>;

  return (
    <iframe
      title="Visualizador de PDF"
      src={url}
      className="h-[70vh] w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
    />
  );
}

