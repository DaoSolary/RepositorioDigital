-- Acervo Digital de TCC - Supabase (PostgreSQL)
-- Rode este script no SQL Editor do Supabase.

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Enum de roles (opcional; aqui usamos text + constraint para simplicidade)

-- =========================
-- Tabelas principais
-- =========================

create table if not exists public.tccs (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  autor text not null,
  orientador text not null,
  curso text not null,
  ano integer not null,
  resumo text not null,
  palavras_chave text[] not null default '{}'::text[],
  pdf_path text not null, -- caminho no bucket "tccs" (ex: <uuid>.pdf)
  download_count integer not null default 0,
  view_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists tccs_ano_idx on public.tccs (ano desc);
create index if not exists tccs_curso_idx on public.tccs (curso);
create index if not exists tccs_busca_trgm_idx on public.tccs using gin (
  (titulo || ' ' || autor || ' ' || orientador) gin_trgm_ops
);
create index if not exists tccs_palavras_gin_idx on public.tccs using gin (palavras_chave);

-- Roles (RBAC)
create table if not exists public.roles (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('ADMIN','USER')),
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- Favoritos (extra)
create table if not exists public.favorites (
  id bigserial primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  tcc_id uuid not null references public.tccs (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, tcc_id)
);

-- Submissions (opcional)
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  autor text not null,
  orientador text,
  curso text,
  ano integer,
  resumo text,
  palavras_chave text[] not null default '{}'::text[],
  pdf_path text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

-- =========================
-- RLS
-- =========================
alter table public.tccs enable row level security;
alter table public.roles enable row level security;
alter table public.favorites enable row level security;
alter table public.submissions enable row level security;

-- Helper: é admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.roles r
    where r.user_id = auth.uid()
      and r.role = 'ADMIN'
  );
$$;

-- tccs: público pode ler; somente admin pode escrever
drop policy if exists "tccs_select_public" on public.tccs;
create policy "tccs_select_public"
on public.tccs for select
using (true);

-- Incremento seguro de download (extra)
create or replace function public.increment_tcc_download(p_tcc_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.tccs
  set download_count = download_count + 1
  where id = p_tcc_id;
$$;

grant execute on function public.increment_tcc_download(uuid) to anon, authenticated;

-- Incremento seguro de visualização (extra)
create or replace function public.increment_tcc_view(p_tcc_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.tccs
  set view_count = view_count + 1
  where id = p_tcc_id;
$$;

grant execute on function public.increment_tcc_view(uuid) to anon, authenticated;

drop policy if exists "tccs_insert_admin" on public.tccs;
create policy "tccs_insert_admin"
on public.tccs for insert
with check (public.is_admin());

drop policy if exists "tccs_update_admin" on public.tccs;
create policy "tccs_update_admin"
on public.tccs for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "tccs_delete_admin" on public.tccs;
create policy "tccs_delete_admin"
on public.tccs for delete
using (public.is_admin());

-- roles: usuário vê o próprio; admin vê todos
drop policy if exists "roles_select_self_or_admin" on public.roles;
create policy "roles_select_self_or_admin"
on public.roles for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "roles_write_admin" on public.roles;
create policy "roles_write_admin"
on public.roles for all
using (public.is_admin())
with check (public.is_admin());

-- favorites: autenticado gerencia os próprios
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
on public.favorites for select
using (auth.uid() = user_id);

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
on public.favorites for insert
with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
on public.favorites for delete
using (auth.uid() = user_id);

-- submissions: qualquer autenticado pode criar; admin pode listar/moderar
drop policy if exists "submissions_insert_auth" on public.submissions;
create policy "submissions_insert_auth"
on public.submissions for insert
with check (auth.uid() is not null);

drop policy if exists "submissions_select_admin" on public.submissions;
create policy "submissions_select_admin"
on public.submissions for select
using (public.is_admin());

drop policy if exists "submissions_update_admin" on public.submissions;
create policy "submissions_update_admin"
on public.submissions for update
using (public.is_admin())
with check (public.is_admin());

-- =========================
-- Storage policies (bucket: tccs)
-- =========================
-- Crie o bucket "tccs" (Storage) no painel (ou via UI). Deixe como PRIVATE.
-- Em seguida rode as policies abaixo.

-- Permite leitura (download e signed URLs) para qualquer um.
drop policy if exists "storage_tccs_read_public" on storage.objects;
create policy "storage_tccs_read_public"
on storage.objects for select
using (bucket_id = 'tccs');

-- Somente admin pode fazer upload/alterar/remover.
drop policy if exists "storage_tccs_write_admin" on storage.objects;
create policy "storage_tccs_write_admin"
on storage.objects for insert
with check (bucket_id = 'tccs' and public.is_admin());

drop policy if exists "storage_tccs_update_admin" on storage.objects;
create policy "storage_tccs_update_admin"
on storage.objects for update
using (bucket_id = 'tccs' and public.is_admin())
with check (bucket_id = 'tccs' and public.is_admin());

drop policy if exists "storage_tccs_delete_admin" on storage.objects;
create policy "storage_tccs_delete_admin"
on storage.objects for delete
using (bucket_id = 'tccs' and public.is_admin());

