import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { fetchAdminDashboardStats } from "@/lib/stats";

export async function GET() {
  const { isAdmin } = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const stats = await fetchAdminDashboardStats();
  return NextResponse.json(stats);
}
