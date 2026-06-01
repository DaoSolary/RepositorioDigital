import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { generateApiKey } from "@/lib/api-keys";
import { z } from "zod";

const CreateSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  const { isAdmin } = await assertAdmin();
  if (!isAdmin) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const service = await createSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ error: "Service role não configurada." }, { status: 500 });

  const { data, error } = await service
    .from("api_keys")
    .select("id,name,key_prefix,permissions,active,last_used_at,expires_at,created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: Request) {
  const { isAdmin, user } = await assertAdmin();
  if (!isAdmin || !user) return NextResponse.json({ error: "Proibido." }, { status: 403 });

  const body = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Nome inválido." }, { status: 400 });

  const service = await createSupabaseServiceRoleClient();
  if (!service) return NextResponse.json({ error: "Service role não configurada." }, { status: 500 });

  const { raw, hash, prefix } = generateApiKey();

  const { data, error } = await service
    .from("api_keys")
    .insert({
      name: body.data.name,
      key_hash: hash,
      key_prefix: prefix,
      created_by: user.id,
      permissions: ["read"],
    })
    .select("id,name,key_prefix,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    key: raw,
    item: data,
    warning: "Guarde esta chave agora. Ela não será exibida novamente.",
  });
}
