import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SimpleBarChart } from "@/components/SimpleBarChart";
import { fetchAdminDashboardStats } from "@/lib/stats";

export default async function AdminDashboardPage() {
  const stats = await fetchAdminDashboardStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-zinc-500">
            <span>Total de trabalhos</span>
            <span>📚</span>
          </div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{stats.totalTccs}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-zinc-500">
            <span>Total de downloads</span>
            <span>⬇️</span>
          </div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{stats.totalDownloads}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-zinc-500">
            <span>Visualizações</span>
            <span>👁️</span>
          </div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{stats.totalViews}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-zinc-500">
            <span>Usuários ativos (30d)</span>
            <span>👤</span>
          </div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{stats.activeUsers}</div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="section-title text-base font-semibold">Downloads por mês</h2>
          <div className="mt-4">
            <SimpleBarChart
              items={stats.downloadsByMonth.map((m) => ({ label: m.month, value: m.count }))}
            />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="section-title text-base font-semibold">Cursos mais acessados</h2>
          <div className="mt-4">
            <SimpleBarChart
              items={(stats.topCourses as { curso: string; total_views: number }[]).map((c) => ({
                label: c.curso,
                value: Number(c.total_views ?? 0),
              }))}
            />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="section-title text-base font-semibold">Trabalhos recentes</h2>
          <Link href="/admin/tccs/new">
            <Button size="sm">Novo TCC</Button>
          </Link>
        </div>
        <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
          {stats.recentTccs.map((t) => (
            <div key={t.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{t.titulo}</div>
                <div className="text-sm text-zinc-500">
                  {t.autor} • {t.curso} • {new Date(t.created_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span>{t.view_count} views</span>
                <span>•</span>
                <span>{t.download_count} downloads</span>
                <Link href={`/admin/tccs/${t.id}/edit`}>
                  <Button variant="secondary" size="sm">
                    Editar
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
