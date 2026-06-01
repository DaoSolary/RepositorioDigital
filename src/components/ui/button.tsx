import * as React from "react";
import { cn } from "@/lib/ui/cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-xl font-medium transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
        size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm",
        variant === "primary" &&
          "bg-zinc-900 text-white shadow-sm hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
        variant === "secondary" &&
          "border border-zinc-200 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800",
        variant === "danger" &&
          "bg-red-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500",
        variant === "ghost" &&
          "bg-transparent text-zinc-900 hover:bg-zinc-100 dark:text-zinc-50 dark:hover:bg-zinc-900",
        className,
      )}
      {...props}
    />
  );
}

