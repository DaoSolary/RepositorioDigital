"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { isMobilePdfHost } from "@/lib/pdf/mobile-host";

type PdfViewerProps = { tccId: string };

/**
 * Desktop: iframe com PDF na mesma origem (/api/.../preview).
 * Android/iOS: iframe mostra "conteúdo bloqueado"; usa object/embed com blob URL
 * e botão para abrir o PDF no visualizador nativo do browser.
 */
export function PdfViewer({ tccId }: PdfViewerProps) {
  const previewUrl = `/api/tccs/${tccId}/preview`;
  const [mobile, setMobile] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setMobile(isMobilePdfHost());
  }, []);

  useEffect(() => {
    if (!mobile) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    fetch(previewUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Não foi possível carregar o PDF.");
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setBlobUrl(url);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Falha ao carregar o PDF.";
        setLoadError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [mobile, previewUrl]);

  if (!mobile) {
    return (
      <iframe
        title="Visualizador de PDF"
        src={previewUrl}
        className="h-[60vh] w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 sm:h-[70vh]"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Link href={previewUrl} className="inline-flex">
          <Button size="sm" type="button">
            Abrir PDF para leitura
          </Button>
        </Link>
        <Link href={`/api/tccs/${tccId}/download`} className="inline-flex">
          <Button size="sm" variant="secondary" type="button">
            Transferir PDF
          </Button>
        </Link>
      </div>
      <p className="text-xs text-zinc-500">
        No telemóvel, o leitor integrado do browser abre em ecrã completo. Use o botão «Voltar»
        do browser para regressar ao trabalho.
      </p>

      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
          A carregar PDF…
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          {loadError} Utilize «Abrir PDF para leitura» acima.
        </div>
      ) : null}

      {blobUrl ? (
        <object
          data={blobUrl}
          type="application/pdf"
          className="h-[60vh] w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 sm:h-[70vh]"
          aria-label="Visualizador de PDF"
        >
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            <p>Não foi possível mostrar o PDF nesta página.</p>
            <Link href={previewUrl}>
              <Button size="sm" type="button">
                Abrir PDF para leitura
              </Button>
            </Link>
          </div>
        </object>
      ) : null}
    </div>
  );
}
