import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { AdminNav } from "@/components/admin/AdminNav";
import { getCurrentRole } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentRole();
  if (role !== "ADMIN") {
    redirect("/");
  }
  return (
    <main className="flex-1">
      <Container className="space-y-6 py-10">
        <div className="surface-card p-6">
          <h1 className="section-title text-3xl font-semibold tracking-tight">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Gestão completa do acervo, usuários, segurança e integrações.
          </p>
        </div>
        <AdminNav />
        {children}
      </Container>
    </main>
  );
}
