import * as React from "react";
import { cn } from "@/lib/ui/cn";

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-zinc-200/80 bg-white px-3.5 text-sm outline-none ring-zinc-400/70 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
        className,
      )}
      {...props}
    />
  );
}

