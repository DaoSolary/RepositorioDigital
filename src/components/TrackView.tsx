"use client";

import * as React from "react";

export function TrackView({ tccId }: { tccId: string }) {
  React.useEffect(() => {
    fetch(`/api/tccs/${tccId}/view`, { method: "POST" }).catch(() => {});
  }, [tccId]);
  return null;
}

