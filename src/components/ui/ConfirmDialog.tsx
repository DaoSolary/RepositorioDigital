"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Sim",
  cancelLabel = "Não",
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Fechar"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <h2 id="confirm-dialog-title" className="text-base font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? "Aguarde..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
