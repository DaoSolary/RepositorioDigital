/**
 * Visualização inline do PDF via mesma origem (/api/.../preview).
 * Android não exibe PDF em iframe com URL externa (Supabase); o proxy resolve isso.
 */
export function PdfViewer({ tccId }: { tccId: string }) {
  return (
    <iframe
      title="Visualizador de PDF"
      src={`/api/tccs/${tccId}/preview`}
      className="h-[60vh] w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 sm:h-[70vh]"
    />
  );
}
