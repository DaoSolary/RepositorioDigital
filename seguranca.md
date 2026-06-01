# Segurança do Acervo Digital de TCC

Este documento descreve as medidas de segurança implementadas na aplicação, os ficheiros centrais e boas práticas para produção.

---

## 1. Envio de email (produção com Supabase)

Os emails de **recuperação de senha** e **confirmação de cadastro** voltaram a ser enviados pelo **SMTP embutido do Supabase** (`/auth/v1/recover` e `/auth/v1/resend`).

| Ambiente | Limite típico |
|----------|----------------|
| Plano Free | ~2 emails/hora (projeto inteiro) |
| SMTP customizado no painel Supabase | Limites configuráveis |

**Ficheiros:**

- `src/app/api/auth/forgot-password/route.ts` — pedido de reset
- `src/app/api/auth/resend-verification/route.ts` — reenvio de confirmação
- `src/lib/auth/supabase-auth-api.ts` — chamadas à API Auth do Supabase

Para produção com mais volume, configure **SMTP customizado** em *Authentication → SMTP* no painel Supabase (ver `docs/SUPABASE-SETUP.md`).

---

## 2. Autenticação e sessão

### Cookie assinado (`app_session`)

A sessão **não** usa cookies Supabase no browser (evita conflitos de refresh). Usa um JWT-like assinado com HMAC-SHA256.

| Ficheiro | Função |
|----------|--------|
| `src/lib/auth/app-session.ts` | Criação, leitura e validação do token; expiração |
| `src/lib/auth/cookies.ts` | Flags `httpOnly`, `secure` (produção), `sameSite: lax` |
| `src/lib/auth/issue-session.ts` | Emite sessão após login com role no token |
| `middleware.ts` | Exige login em `/admin`, `/account`; remove cookies legados `sb-*` |

### `SESSION_SECRET` em produção

Em **produção**, é **obrigatório** definir `SESSION_SECRET` com pelo menos **32 caracteres** aleatórios. O sistema **não** usa mais a chave anon como fallback em produção.

```bash
# Exemplo para gerar segredo
openssl rand -hex 32
```

### Identidade só pelo cookie

`src/lib/supabase/session.ts` — `getServerAuth()` usa **apenas** o cookie `app_session` assinado. Headers como `x-user-id` enviados pelo cliente **não** são usados para identificar utilizador (anti-spoofing).

O middleware define `x-user-id` só para uso interno opcional; a autorização real passa pelo cookie.

### Recuperação de senha

| Ficheiro | Função |
|----------|--------|
| `src/app/auth/callback/route.ts` | Troca `code` PKCE; ponte HTML para tokens no hash |
| `src/app/api/auth/recovery-setup/route.ts` | Grava cookie `app_recovery` (30 min) |
| `src/app/api/auth/reset-password/route.ts` | Altera senha com token de recuperação |
| `src/lib/auth/recovery-session.ts` | Cookie de recuperação separado da sessão normal |

---

## 3. Autorização (ADMIN vs USER)

| Camada | Ficheiro |
|--------|----------|
| Middleware | `middleware.ts` — bloqueia não autenticados; bloqueia não-ADMIN se role no JWT |
| Layout admin | `src/app/admin/layout.tsx` — `getCurrentRole()` + redirect |
| APIs admin | `src/lib/admin.ts` — `assertAdmin()` com service role |
| Roles na BD | `src/lib/roles.ts` — `lookupUserRole()` (service role, ignora RLS incorreto com anon) |
| Políticas RLS | `supabase/schema.sql`, `supabase/migrations/002_extended_features.sql` |

A chave **`SUPABASE_SERVICE_ROLE_KEY`** existe **só no servidor** e nunca deve ir para o cliente (`NEXT_PUBLIC_*`).

---

## 4. Rate limiting (anti brute-force / abuso)

Limites por **IP** em memória (adequado a uma instância; em múltiplas réplicas considerar Redis).

| Ficheiro | Função |
|----------|--------|
| `src/lib/security/rate-limit.ts` | Contador por chave + janela temporal |
| `src/lib/security/api-guard.ts` | Limites pré-definidos para auth |
| `src/lib/security/request.ts` | Extração de IP (`x-forwarded-for`, `x-real-ip`) |

| Endpoint | Limite |
|----------|--------|
| `POST /api/auth/login` | 10 / 15 min |
| `POST /api/auth/signup` | 5 / hora |
| `POST /api/auth/forgot-password` | 5 / hora |
| `POST /api/auth/resend-verification` | 5 / hora |
| `POST /api/auth/recovery-setup` | 15 / hora |
| `GET /api/v1/*` (com API key) | 120 / min por chave |

Resposta bloqueada: HTTP **429** com header `Retry-After`.

---

## 5. Cabeçalhos HTTP de segurança

Configurados em **`next.config.ts`** para todas as rotas:

- `X-Frame-Options: SAMEORIGIN` — anti-clickjacking
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — desativa câmera/microfone/geolocalização
- `Content-Security-Policy` — restringe origens de script, imagem, `connect-src` (inclui `*.supabase.co`)
- `Strict-Transport-Security` — **apenas em produção** (HTTPS)

---

## 6. Validação de entrada

| Área | Ficheiro |
|------|----------|
| Login/cadastro | `src/lib/validators/auth.ts` — Zod (email max 254, senha min 6) |
| TCCs admin | `src/lib/validators/tcc.ts` |
| Upload PDF | `src/app/api/admin/tccs/route.ts` — tipo MIME, tamanho máximo (`NEXT_PUBLIC_MAX_PDF_MB`) |
| API v1 ID | `src/app/api/v1/tccs/[id]/route.ts` — UUID validado |

---

## 7. Anti open redirect

Parâmetro `?next=` validado para caminhos **relativos internos** apenas.

| Ficheiro |
|----------|
| `src/lib/security/safe-redirect.ts` |
| `src/app/auth/callback/route.ts` |
| `src/app/login/LoginClient.tsx` |

Bloqueia: `//evil.com`, URLs com `://`, `\`, `@`.

---

## 8. API pública v1

| Ficheiro | Função |
|----------|--------|
| `src/lib/api-keys.ts` | Chaves com prefixo `tcc_`; hash SHA-256 na BD; expiração |
| `src/app/api/v1/tccs/route.ts` | Lista sem expor `pdf_path` |
| `src/app/api/admin/api-keys/route.ts` | Só ADMIN cria/revoga chaves |

Nunca commitar chaves API em repositório. Rotacionar se expostas.

---

## 9. Base de dados (Supabase)

- **RLS** ativo em `tccs`, `roles`, `favorites`, `profiles`, `activity_logs`, etc.
- Funções `security definer` para incrementos de view/download (`increment_tcc_view`, `increment_tcc_download`)
- Leitura pública de TCCs; escrita apenas para ADMIN (via `is_admin()`)

---

## 10. SSL em desenvolvimento

`src/lib/supabase/dev-tls.ts` — `SUPABASE_INSECURE_SSL=1` **só** com `NODE_ENV=development`. Não usar em produção.

---

## 11. Checklist de produção

- [ ] `SESSION_SECRET` com 32+ caracteres aleatórios
- [ ] `SUPABASE_SERVICE_ROLE_KEY` só no servidor (Vercel/hosting secrets)
- [ ] `NEXT_PUBLIC_SITE_URL` com HTTPS correto
- [ ] Redirect URLs no Supabase alinhadas com o domínio
- [ ] SMTP customizado se precisar de mais de ~2 emails/hora
- [ ] HTTPS ativo (HSTS aplicado automaticamente)
- [ ] Não expor `.env.local` no Git
- [ ] Revisar utilizadores ADMIN em `public.roles`
- [ ] Ativar logs/monitorização no hosting

---

## 12. Ficheiros-chave (resumo)

```
middleware.ts                          # Porta de entrada: sessão, admin, cookies legados
next.config.ts                         # Cabeçalhos de segurança (CSP, HSTS, etc.)
src/lib/auth/app-session.ts            # Assinatura HMAC da sessão
src/lib/auth/cookies.ts                # Cookies httpOnly / secure
src/lib/supabase/session.ts            # Identidade só pelo cookie
src/lib/roles.ts                       # Leitura segura de roles (service role)
src/lib/admin.ts                       # Verificação ADMIN nas APIs
src/lib/security/rate-limit.ts         # Anti brute-force
src/lib/security/api-guard.ts          # Limites nos endpoints de auth
src/lib/security/safe-redirect.ts      # Anti open redirect
src/lib/api-keys.ts                    # API keys com hash
supabase/schema.sql                    # RLS e políticas
.env.example                           # Variáveis sensíveis documentadas
```

---

## 13. Limitações conhecidas

1. **Rate limit em memória** — reinicia com deploy/cold start; múltiplos servidores não partilham contador.
2. **Emails Supabase Free** — limite baixo; não é contornável só no código.
3. **CSP** — inclui `'unsafe-inline'` / `'unsafe-eval'` por compatibilidade com Next.js; pode ser endurecido com nonces numa fase posterior.

Para dúvidas de configuração Supabase, ver `docs/SUPABASE-SETUP.md` e `docs/SUPABASE-EMAIL-TEMPLATES.md`.
