## Acervo Digital de TCC (Next.js + Supabase)

Aplicação web completa para **listar, buscar e visualizar TCCs** (área pública), **gestão administrativa** e **integração via API** para sites universitários, bibliotecas digitais e apps móveis.

### Stack

- **Next.js 15 (App Router)** + TypeScript
- **Tailwind CSS v4**
- **Supabase**: Postgres + Auth + Storage

### Funcionalidades

#### Usuários
- Cadastro com **confirmação por email** (Supabase Auth)
- Login com email/senha e **Google OAuth**
- **Recuperação de senha** e reenvio de verificação
- **Perfil completo** (`/account/profile`)
- **Favoritos** (`/account/favorites`)
- **Estatísticas públicas**: mais vistos, mais baixados, autores em destaque, áreas em alta

#### Administrador (`/admin`)
- **Dashboard** com totais, gráficos e trabalhos recentes
- Gestão de TCCs, usuários (criar, suspender, roles, resetar senha)
- **Logs de atividade** e **auditoria**
- **Backup** exportável (JSON)
- **Chaves de API** para integrações

#### API pública v1
- `GET /api/v1/tccs` — listagem com busca e filtros
- `GET /api/v1/tccs/[id]` — detalhe
- `GET /api/v1/stats` — estatísticas
- Autenticação: header `X-API-Key`
- Documentação: `/api-docs`

---

## Deploy em produção (Vercel)

Guia completo: **[instrucao.md](./instrucao.md)** (Git → GitHub → Vercel → Supabase).

---

## Setup (local)

### 1) Criar projeto no Supabase

Copie URL, anon key e (recomendado) service role key.

### 2) Banco (SQL + RLS)

No **SQL Editor**, execute em ordem:

1. `supabase/schema.sql`
2. `supabase/migrations/002_extended_features.sql`

Em **Storage**, crie o bucket **`tccs`** (Private).

### 3) Auth no Supabase (Dashboard)

- **Authentication → Providers → Google**: habilite e configure Client ID/Secret
- **Authentication → URL Configuration**:
  - Site URL: `http://localhost:3000` (ou produção)
  - Redirect URLs: `http://localhost:3000/auth/callback`
- **Authentication → Email**: habilite confirmação de email para novos cadastros

### 4) Variáveis de ambiente

Copie `.env.example` → `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_MAX_PDF_MB=20
```

`SUPABASE_SERVICE_ROLE_KEY` é necessária para Admin (usuários, backup, API keys, logs).

### 5) Criar admin

```sql
insert into public.roles (user_id, role)
values ('<UUID_DO_USER>', 'ADMIN')
on conflict (user_id) do update set role = excluded.role;
```

### 6) Rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

---

## Rotas principais

| Área | Rotas |
|------|--------|
| Público | `/`, `/tcc/[id]`, `/estatisticas`, `/api-docs` |
| Auth | `/login`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email` |
| Conta | `/account/profile`, `/account/favorites`, `/account/security` |
| Admin | `/admin`, `/admin/tccs`, `/admin/users`, `/admin/activity`, `/admin/audit`, `/admin/backup`, `/admin/api-keys` |

---

## Segurança

- Middleware protege `/admin` (sessão + role ADMIN)
- Contas suspensas são bloqueadas no login
- RLS no Postgres; uploads apenas PDF
- Logs de atividade e trilha de auditoria para ações administrativas
