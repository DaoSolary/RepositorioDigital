"use client";

import * as React from "react";

export function FeedbackMessage({
  type,
  message,
  onDismiss,
}: {
  type: "error" | "success";
  message: string;
  onDismiss: () => void;
}) {
  React.useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  return (
    <div
      role="alert"
      className={
        type === "error"
          ? "flex items-start justify-between gap-2 rounded-lg border border-red-200/80 bg-red-50/90 px-3.5 py-2.5 text-sm text-red-800 shadow-sm dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          : "flex items-start justify-between gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-2.5 text-sm text-emerald-800 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
      }
    >
      <span className="leading-relaxed">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
        aria-label="Fechar mensagem"
      >
        ✕
      </button>
    </div>
  );
}
