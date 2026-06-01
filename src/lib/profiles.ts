import { createSupabaseDbClient } from "@/lib/supabase/db";

export type Profile = {
  user_id: string;
  nome: string | null;
  bio: string | null;
  instituicao: string | null;
  curso: string | null;
  avatar_url: string | null;
  updated_at: string;
};

export async function getProfile(userId: string) {
  const supabase = createSupabaseDbClient();
  const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
  return (data ?? null) as Profile | null;
}

export async function upsertProfile(userId: string, input: Partial<Profile>) {
  const supabase = createSupabaseDbClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      user_id: userId,
      nome: input.nome,
      bio: input.bio,
      instituicao: input.instituicao,
      curso: input.curso,
      avatar_url: input.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function isUserSuspended(userId: string) {
  try {
    const supabase = createSupabaseDbClient();
    const { data, error } = await supabase
      .from("user_status")
      .select("suspended")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return false;
    return data?.suspended === true;
  } catch {
    return false;
  }
}
