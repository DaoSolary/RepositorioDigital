import { NextResponse } from "next/server";
import { createSupabaseDbClient } from "@/lib/supabase/db";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createSupabaseDbClient();
  await supabase.rpc("increment_tcc_view", { p_tcc_id: id });
  return NextResponse.json({ ok: true });
}

