"use client";

import * as React from "react";
import { cn } from "@/lib/ui/cn";

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; message: string };

const ToastContext = React.createContext<{
  pushToast: (type: ToastType, message: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const pushToast = React.useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((prev) => [...prev, { id, type, message }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, 4200);
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[220] flex w-full max-w-sm flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto rounded-xl border px-3.5 py-3 text-sm shadow-lg backdrop-blur",
              item.type === "success" &&
                "border-emerald-200 bg-emerald-50/95 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200",
              item.type === "error" &&
                "border-red-200 bg-red-50/95 text-red-800 dark:border-red-900 dark:bg-red-950/80 dark:text-red-200",
              item.type === "info" &&
                "border-zinc-200 bg-white/95 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-100",
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
