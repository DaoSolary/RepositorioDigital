import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { isAdmin } = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const service = await createSupabaseServiceRoleClient();
  if (!service) {
    return NextResponse.json({ error: "Service role não configurada." }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 100), 200);

  const { data, error } = await service
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
