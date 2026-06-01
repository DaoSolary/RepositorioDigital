import { createHash, randomBytes } from "crypto";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export function generateApiKey() {
  const raw = `tcc_${randomBytes(24).toString("hex")}`;
  const hash = hashApiKey(raw);
  const prefix = raw.slice(0, 12);
  return { raw, hash, prefix };
}

export function hashApiKey(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

export async function validateApiKey(key: string | null) {
  if (!key || !key.startsWith("tcc_")) return null;

  const service = await createSupabaseServiceRoleClient();
  if (!service) return null;

  const hash = hashApiKey(key);
  const { data } = await service
    .from("api_keys")
    .select("id,name,permissions,active,expires_at")
    .eq("key_hash", hash)
    .eq("active", true)
    .maybeSingle();

  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  await service
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data.id);

  return data as { id: string; name: string; permissions: string[] };
}
