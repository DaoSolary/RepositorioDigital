-- Extensões do Acervo Digital de TCC
-- Rode após schema.sql no SQL Editor do Supabase.

-- =========================
-- Perfis de usuário
-- =========================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  bio text,
  instituicao text default 'Universidade Kimpa Vita',
  curso text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = user_id);

-- =========================
-- Status do usuário (suspensão)
-- =========================
create table if not exists public.user_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  suspended boolean not null default false,
  suspended_at timestamptz,
  suspended_reason text,
  updated_at timestamptz not null default now()
);

alter table public.user_status enable row level security;

drop policy if exists "user_status_select_admin" on public.user_status;
create policy "user_status_select_admin"
on public.user_status for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "user_status_write_admin" on public.user_status;
create policy "user_status_write_admin"
on public.user_status for all
using (public.is_admin())
with check (public.is_admin());

-- =========================
-- Logs de atividade
-- =========================
create table if not exists public.activity_logs (
  id bigserial primary key,
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_idx on public.activity_logs (created_at desc);
create index if not exists activity_logs_user_idx on public.activity_logs (user_id);

alter table public.activity_logs enable row level security;

drop policy if exists "activity_logs_insert_auth" on public.activity_logs;
create policy "activity_logs_insert_auth"
on public.activity_logs for insert
with check (auth.uid() is not null or auth.uid() = user_id);

drop policy if exists "activity_logs_select_admin" on public.activity_logs;
create policy "activity_logs_select_admin"
on public.activity_logs for select
using (public.is_admin());

-- Permite inserção anônima via service role / security definer
create or replace function public.log_activity(
  p_user_id uuid,
  p_action text,
  p_resource_type text default null,
  p_resource_id text default null,
  p_metadata jsonb default '{}'::jsonb,
  p_ip_address text default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_logs (user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
  values (p_user_id, p_action, p_resource_type, p_resource_id, p_metadata, p_ip_address, p_user_agent);
end;
$$;

grant execute on function public.log_activity(uuid, text, text, text, jsonb, text, text) to anon, authenticated;

-- =========================
-- Auditoria (alterações admin)
-- =========================
create table if not exists public.audit_log (
  id bigserial primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  table_name text not null,
  record_id text,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_created_idx on public.audit_log (created_at desc);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_select_admin" on public.audit_log;
create policy "audit_log_select_admin"
on public.audit_log for select
using (public.is_admin());

create or replace function public.write_audit(
  p_actor_id uuid,
  p_action text,
  p_table_name text,
  p_record_id text default null,
  p_old_data jsonb default null,
  p_new_data jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (actor_id, action, table_name, record_id, old_data, new_data)
  values (p_actor_id, p_action, p_table_name, p_record_id, p_old_data, p_new_data);
end;
$$;

grant execute on function public.write_audit(uuid, text, text, text, jsonb, jsonb) to authenticated;

-- =========================
-- Histórico de alterações em TCCs
-- =========================
create table if not exists public.tcc_history (
  id bigserial primary key,
  tcc_id uuid not null references public.tccs (id) on delete cascade,
  changed_by uuid references auth.users (id) on delete set null,
  action text not null check (action in ('create','update','delete')),
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists tcc_history_tcc_idx on public.tcc_history (tcc_id, created_at desc);

alter table public.tcc_history enable row level security;

drop policy if exists "tcc_history_select_admin" on public.tcc_history;
create policy "tcc_history_select_admin"
on public.tcc_history for select
using (public.is_admin());

-- =========================
-- Chaves de API pública
-- =========================
create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  key_hash text not null unique,
  key_prefix text not null,
  created_by uuid references auth.users (id) on delete set null,
  permissions text[] not null default array['read']::text[],
  last_used_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.api_keys enable row level security;

drop policy if exists "api_keys_admin" on public.api_keys;
create policy "api_keys_admin"
on public.api_keys for all
using (public.is_admin())
with check (public.is_admin());

-- =========================
-- Registros de backup
-- =========================
create table if not exists public.backup_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('running','success','failed')),
  file_count integer default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.backup_runs enable row level security;

drop policy if exists "backup_runs_admin" on public.backup_runs;
create policy "backup_runs_admin"
on public.backup_runs for all
using (public.is_admin())
with check (public.is_admin());

-- =========================
-- Trigger: novo usuário → perfil + role USER
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;

  insert into public.roles (user_id, role)
  values (new.id, 'USER')
  on conflict (user_id) do nothing;

  insert into public.user_status (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- View: estatísticas por curso
create or replace view public.stats_by_course as
select
  curso,
  count(*)::int as total_tccs,
  coalesce(sum(view_count), 0)::bigint as total_views,
  coalesce(sum(download_count), 0)::bigint as total_downloads
from public.tccs
group by curso
order by total_views desc;

grant select on public.stats_by_course to anon, authenticated;
