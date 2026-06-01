import * as React from "react";
import { cn } from "@/lib/ui/cn";

type StatusTone = "success" | "warning" | "danger" | "neutral" | "info";

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "success" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
        tone === "warning" && "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
        tone === "danger" && "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
        tone === "info" && "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
        tone === "neutral" && "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
