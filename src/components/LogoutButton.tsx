"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  async function doLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
      >
        {loading ? "Saindo..." : "Sair"}
      </Button>

      <ConfirmDialog
        open={showConfirm}
        title="Sair da conta"
        message="Deseja realmente sair?"
        confirmLabel="Sim"
        cancelLabel="Não"
        loading={loading}
        onConfirm={doLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
