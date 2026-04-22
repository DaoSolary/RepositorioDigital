## Acervo Digital de TCC (Next.js + Supabase)

Aplicação web completa para **listar, buscar e visualizar TCCs** (área pública) e permitir que **administradores** façam **upload, edição e exclusão** (área `/admin`).

### Stack

- **Next.js (App Router)** + TypeScript
- **Tailwind CSS**
- **Supabase**: Postgres + Auth + Storage

### Funcionalidades

- **Área pública**: listagem paginada, busca (debounce), filtros (curso/ano), detalhe, **visualizador de PDF** e download
- **Auth**: login/sair (email/senha)
- **RBAC**: `ADMIN` / `USER` (admin gerencia TCCs)
- **Extras**: **favoritar** e **contador de downloads**

---

## Setup (local)

### 1) Criar projeto no Supabase

- Crie um projeto no Supabase e copie:
  - `Project URL`
  - `anon public key`
  - (opcional) `service_role key`

### 2) Banco (SQL + RLS)

No Supabase, abra **SQL Editor** e rode:

- `supabase/schema.sql`

Depois, em **Storage**:

- Crie o bucket **`tccs`**
- Marque como **Private**

### 3) Criar um usuário admin

1. No Supabase Auth, crie um usuário (email/senha)
2. No SQL Editor, associe o role:

```sql
insert into public.roles (user_id, role)
values ('<UUID_DO_USER>', 'ADMIN')
on conflict (user_id) do update set role = excluded.role;
```

### 4) Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MAX_PDF_MB=20
```

### 5) Instalar e rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

---

## Rotas principais

- **Público**
  - `/` (lista/busca/filtros/paginação)
  - `/tcc/[id]` (detalhe + PDF embed + download)
- **Auth**
  - `/login`
- **Admin (RBAC)**
  - `/admin`
  - `/admin/tccs/new`
  - `/admin/tccs/[id]/edit`

---

## Notas de segurança

- O acesso a `/admin` é protegido no `middleware.ts` e reforçado em `/api/admin/*`.
- Uploads aceitam **apenas PDF** e respeitam `NEXT_PUBLIC_MAX_PDF_MB`.
- O `pdf_path` é salvo no banco e o acesso ao arquivo é feito via **Signed URL**.

