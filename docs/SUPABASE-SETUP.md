# Configuração do Supabase (Google + Emails)

Projeto: `gsbahvmkesfccqqdnenf` (ajuste se usar outro).

## 1. Executar SQL (obrigatório)

No **SQL Editor** do Supabase, execute **nesta ordem**:

1. `supabase/schema.sql`
2. `supabase/migrations/002_extended_features.sql`

Sem isso, perfis, logs e suspensão de usuários não funcionam.

---

## 2. Variáveis no `.env.local`

No painel: **Project Settings → API**

| Variável | Onde copiar |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon public** (JWT que começa com `eyJ...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | **service_role** (secreta, só no servidor) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` (dev) ou URL de produção |

> **Atenção:** use a chave **anon** em formato JWT (`eyJ...`), não apenas `sb_publishable_...`, a menos que seu projeto Supabase documente o contrário para o SDK que você usa.

Exemplo `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_MAX_PDF_MB=20
```

---

## 3. URLs de redirecionamento (Auth)

**Authentication → URL Configuration**

| Campo | Valor (desenvolvimento) |
|-------|-------------------------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |
| | `http://localhost:3000/auth/reset-password` |

Em produção, adicione também `https://seu-dominio.com/auth/callback`.

---

## 4. Email (confirmação + recuperação de senha)

**Authentication → Providers → Email**

- [x] Enable Email provider
- [x] **Confirm email** (cadastro exige verificação)
- [ ] Desmarque "Secure email change" se quiser fluxo mais simples em dev

**Authentication → Email Templates** — copie os textos em português de `docs/SUPABASE-EMAIL-TEMPLATES.md`:

- **Confirm signup** e **Reset password** em PT-BR
- O link de recuperação usa `/auth/callback?next=/auth/reset-password&type=recovery`

### SMTP customizado (recomendado em produção)

**Project Settings → Authentication → SMTP Settings**

Configure Resend, SendGrid ou Gmail SMTP para emails não caírem em spam.

Em desenvolvimento, os emails aparecem em **Authentication → Users** (logs) ou no inbox se SMTP estiver ativo.

---

## 5. Google OAuth

### 5.1 Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto (ou use existente)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
4. Tipo: **Web application**
5. **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `https://SEU_PROJETO.supabase.co`
6. **Authorized redirect URIs:**
   - `https://SEU_PROJETO.supabase.co/auth/v1/callback`
   - (copie exatamente do Supabase: **Authentication → Providers → Google**)

### 5.2 Supabase

**Authentication → Providers → Google**

- Enable Google
- Cole **Client ID** e **Client Secret** do Google
- Salve

O app redireciona para `/api/auth/google` → Supabase → `/auth/callback`.

---

## 6. Storage

**Storage → New bucket**

- Nome: `tccs`
- **Private** (não público)

As policies estão em `schema.sql`.

---

## 7. Criar usuário administrador

1. **Authentication → Users → Add user** (email + senha)
2. Copie o **UUID** do usuário
3. SQL Editor:

```sql
insert into public.roles (user_id, role)
values ('UUID-AQUI', 'ADMIN')
on conflict (user_id) do update set role = excluded.role;
```

---

## 8. Erro de certificado SSL no Windows

Se no terminal aparecer `UNABLE_TO_VERIFY_LEAF_SIGNATURE` ao acessar o Supabase:

1. No `.env.local`, adicione (somente desenvolvimento):

```env
SUPABASE_INSECURE_SSL=1
```

2. Reinicie o servidor: `npm run dev`

> Nunca use `SUPABASE_INSECURE_SSL=1` em produção.

---

## 9. Limpar cache Next.js (erro `.next` corrompido)

Se aparecer `UNKNOWN error, open layout.js` ou `middleware-manifest.json`:

```powershell
cd c:\tcc-acervo
# Pare o servidor (Ctrl+C)
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

Feche outras instâncias do `npm run dev` antes de apagar `.next`.

---

## 10. Apenas um servidor dev

Não rode dois `npm run dev` ao mesmo tempo (causa erro `UNKNOWN` ao abrir arquivos em `.next`).

Se a porta 3000 estiver ocupada, encerre o processo antigo antes de iniciar de novo:

```powershell
npm run dev:clean
```

---

## Checklist rápido

- [ ] SQL `schema.sql` executado
- [ ] SQL `002_extended_features.sql` executado
- [ ] Bucket `tccs` criado (private)
- [ ] `.env.local` com chaves corretas (anon JWT)
- [ ] Site URL + Redirect URLs configurados
- [ ] Email confirm habilitado
- [ ] Google OAuth habilitado (opcional)
- [ ] Admin criado na tabela `roles`
- [ ] Pasta `.next` apagada e `npm run dev` reiniciado
