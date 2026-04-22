import { Container } from "@/components/Container";
import { Card } from "@/components/ui/card";
import { AdminTccForm } from "@/components/admin/AdminTccForm";

export default function NewTccPage() {
  return (
    <main className="flex-1">
      <Container className="py-10">
        <Card className="p-6">
          <h1 className="text-xl font-semibold">Novo TCC</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Faça upload do PDF e preencha os metadados.
          </p>
          <div className="mt-6">
            <AdminTccForm mode="create" />
          </div>
        </Card>
      </Container>
    </main>
  );
}

