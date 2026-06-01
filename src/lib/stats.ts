import { createSupabaseDbClient } from "@/lib/supabase/db";
import type { TccRow } from "@/lib/tccs";

export type AcervoHighlights = {
  mostViewed: Pick<TccRow, "id" | "titulo" | "autor" | "curso" | "view_count" | "download_count">[];
  mostDownloaded: Pick<TccRow, "id" | "titulo" | "autor" | "curso" | "view_count" | "download_count">[];
  featuredAuthors: { autor: string; total: number; views: number }[];
  trendingCourses: { curso: string; total: number; views: number; downloads: number }[];
};

export type PublicStats = AcervoHighlights & {
  totalTccs: number;
  totalDownloads: number;
  totalViews: number;
  recentTccs: Pick<TccRow, "id" | "titulo" | "autor" | "curso" | "ano" | "created_at">[];
};

const emptyHighlights = (): AcervoHighlights => ({
  mostViewed: [],
  mostDownloaded: [],
  featuredAuthors: [],
  trendingCourses: [],
});

const emptyStats = (): PublicStats => ({
  ...emptyHighlights(),
  totalTccs: 0,
  totalDownloads: 0,
  totalViews: 0,
  recentTccs: [],
});

function aggregateAuthors(rows: { autor: string | null; view_count: number | null }[]) {
  const authorMap = new Map<string, { total: number; views: number }>();
  for (const row of rows) {
    const key = row.autor?.trim();
    if (!key) continue;
    const cur = authorMap.get(key) ?? { total: 0, views: 0 };
    authorMap.set(key, { total: cur.total + 1, views: cur.views + (row.view_count ?? 0) });
  }
  return Array.from(authorMap.entries())
    .map(([autor, v]) => ({ autor, ...v }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
}

function aggregateCourses(
  rows: { curso: string | null; view_count: number | null; download_count: number | null }[],
) {
  const courseMap = new Map<string, { total: number; views: number; downloads: number }>();
  for (const row of rows) {
    const key = row.curso?.trim();
    if (!key) continue;
    const cur = courseMap.get(key) ?? { total: 0, views: 0, downloads: 0 };
    courseMap.set(key, {
      total: cur.total + 1,
      views: cur.views + (row.view_count ?? 0),
      downloads: cur.downloads + (row.download_count ?? 0),
    });
  }
  return Array.from(courseMap.entries())
    .map(([curso, v]) => ({ curso, ...v }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
}

/** Destaques do acervo — somente dados reais da tabela `tccs`. */
export async function fetchAcervoHighlights(): Promise<AcervoHighlights> {
  try {
    const supabase = createSupabaseDbClient();

    const [
      { data: mostViewed, error: e1 },
      { data: mostDownloaded, error: e2 },
      { data: metaRows, error: e3 },
    ] = await Promise.all([
      supabase
        .from("tccs")
        .select("id,titulo,autor,curso,view_count,download_count")
        .order("view_count", { ascending: false })
        .limit(5),
      supabase
        .from("tccs")
        .select("id,titulo,autor,curso,view_count,download_count")
        .order("download_count", { ascending: false })
        .limit(5),
      supabase.from("tccs").select("autor, curso, view_count, download_count"),
    ]);

    if (e1 || e2 || e3) {
      console.error("fetchAcervoHighlights:", e1?.message ?? e2?.message ?? e3?.message);
      return emptyHighlights();
    }

    return {
      mostViewed: mostViewed ?? [],
      mostDownloaded: mostDownloaded ?? [],
      featuredAuthors: aggregateAuthors(metaRows ?? []),
      trendingCourses: aggregateCourses(metaRows ?? []),
    };
  } catch (e) {
    console.error("fetchAcervoHighlights error:", e);
    return emptyHighlights();
  }
}

/** Estatísticas completas — totais e rankings calculados a partir do banco. */
export async function fetchPublicStats(): Promise<PublicStats> {
  try {
    const supabase = createSupabaseDbClient();
    const highlights = await fetchAcervoHighlights();

    const [
      { count: totalTccs, error: countError },
      { data: counters, error: countersError },
      { data: recentTccs, error: recentError },
    ] = await Promise.all([
      supabase.from("tccs").select("*", { count: "exact", head: true }),
      supabase.from("tccs").select("view_count, download_count"),
      supabase
        .from("tccs")
        .select("id,titulo,autor,curso,ano,created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    if (countError || countersError) {
      console.error("fetchPublicStats:", countError?.message ?? countersError?.message);
      return { ...highlights, ...emptyStats() };
    }

    const totalViews = (counters ?? []).reduce((s, t) => s + (t.view_count ?? 0), 0);
    const totalDownloads = (counters ?? []).reduce((s, t) => s + (t.download_count ?? 0), 0);

    return {
      ...highlights,
      totalTccs: totalTccs ?? 0,
      totalDownloads,
      totalViews,
      recentTccs: recentError ? [] : (recentTccs ?? []),
    };
  } catch (e) {
    console.error("fetchPublicStats error:", e);
    return emptyStats();
  }
}

export async function fetchAdminDashboardStats() {
  const supabase = createSupabaseDbClient();
  const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/server");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const servicePromise = createSupabaseServiceRoleClient();

  const [
    { count: totalTccs },
    { data: counters },
    { data: recentTccs },
    { data: courseStats },
    service,
  ] = await Promise.all([
    supabase.from("tccs").select("*", { count: "exact", head: true }),
    supabase.from("tccs").select("download_count, view_count, created_at"),
    supabase
      .from("tccs")
      .select("id,titulo,autor,curso,created_at,view_count,download_count")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("stats_by_course").select("*").limit(8),
    servicePromise,
  ]);

  const totalDownloads = (counters ?? []).reduce((s, t) => s + (t.download_count ?? 0), 0);
  const totalViews = (counters ?? []).reduce((s, t) => s + (t.view_count ?? 0), 0);

  let activeUsers = 0;
  if (service) {
    const { count } = await service
      .from("activity_logs")
      .select("user_id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString())
      .not("user_id", "is", null);
    activeUsers = count ?? 0;
  }

  const downloadsByMonth: { month: string; count: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    const count = (counters ?? [])
      .filter((t) => {
        const cd = new Date(t.created_at);
        return `${cd.getFullYear()}-${cd.getMonth()}` === monthKey;
      })
      .reduce((s, t) => s + (t.download_count ?? 0), 0);
    downloadsByMonth.push({
      month: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      count,
    });
  }

  return {
    totalTccs: totalTccs ?? 0,
    totalDownloads,
    totalViews,
    activeUsers,
    recentTccs: recentTccs ?? [],
    topCourses: courseStats ?? [],
    downloadsByMonth,
  };
}
