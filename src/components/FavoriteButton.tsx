"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function FavoriteButton({
  tccId,
  initial,
}: {
  tccId: string;
  initial: boolean;
}) {
  const [isFavorite, setIsFavorite] = React.useState(initial);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tccs/${tccId}/favorite`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Falha ao favoritar.");
      setIsFavorite(Boolean(json.isFavorite));
    } catch (e: any) {
      setError(e?.message ?? "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant={isFavorite ? "secondary" : "ghost"} size="sm" onClick={toggle} disabled={loading}>
        {isFavorite ? "Favoritado" : "Favoritar"}
      </Button>
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}

