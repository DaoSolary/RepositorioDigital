import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { getCurrentRole } from "@/lib/auth";

export default async function ApiDocsPage() {
  const role = await getCurrentRole();
  if (role !== "ADMIN") redirect("/");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <main className="flex-1">
      <Container className="space-y-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">API Pública v1</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Configure API para Integração com sites universitários, bibliotecas digitais e aplicativos móveis.
          </p>
        </div>

        <Card className="space-y-4 p-6 text-sm">
          <div>
            <h2 className="font-semibold">Autenticação</h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Envie o header <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">X-API-Key: tcc_...</code> em todas as requisições.
              Chaves são geradas em <strong>Admin → API Keys</strong>.
            </p>
          </div>

          <div>
            <h2 className="font-semibold">Endpoints</h2>
            <ul className="mt-2 space-y-2 font-mono text-xs">
              <li>GET {baseUrl}/api/v1/tccs?q=&curso=&ano=&page=1&pageSize=20</li>
              <li>GET {baseUrl}/api/v1/tccs/[id]</li>
              <li>GET {baseUrl}/api/v1/stats</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold">Exemplo (curl)</h2>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-xs text-zinc-100">{`curl -H "X-API-Key: tcc_sua_chave" \\
  "${baseUrl}/api/v1/tccs?page=1&pageSize=10"`}</pre>
          </div>
        </Card>
      </Container>
    </main>
  );
}
