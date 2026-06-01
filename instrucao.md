# Deploy em produção — Git + Vercel

Guia passo a passo para publicar o **Acervo Digital de TCC** na Vercel, com Supabase em produção.

---

## Pré-requisitos

| Ferramenta | Uso |
|------------|-----|
| [Git](https://git-scm.com/) | Versionar e enviar código |
| Conta [GitHub](https://github.com) | Repositório remoto |
| Conta [Vercel](https://vercel.com) | Hosting (plano Hobby gratuito serve para começar) |
| Projeto [Supabase](https://supabase.com) | Já configurado (SQL + bucket `tccs`) |

Documentação complementar:

- `docs/SUPABASE-SETUP.md` — Auth, URLs, admin
- `seguranca.md` — Segurança e variáveis sensíveis
- `.env.example` — Modelo de variáveis de ambiente

---

## Parte 1 — Preparar o repositório Git

### 1.1 Verificar que segredos não vão para o Git

O ficheiro `.gitignore` já exclui `.env.local`. **Nunca** faça commit de chaves reais.

Confirme:

```powershell
cd c:\tcc-acervo
git status
```

Não deve aparecer `.env.local` na lista de ficheiros a commitar.

### 1.2 Gerar `SESSION_SECRET` (produção)

No PowerShell:

```powershell
# Opção A — OpenSSL (se instalado)
openssl rand -hex 32

# Opção B — Node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Guarde o valor — usará na Vercel (passo 4).

### 1.3 Commit inicial (ou atualização)

```powershell
cd c:\tcc-acervo
git add .
git status
git commit -m "Preparar deploy Vercel: segurança, auth e documentação"
```

Se o Git pedir identidade na primeira vez:

```powershell
git config user.email "seu@email.com"
git config user.name "Seu Nome"
```

---

## Parte 2 — Enviar para o GitHub

### 2.1 Criar repositório no GitHub

1. Aceda a [github.com/new](https://github.com/new)
2. Nome sugerido: `tcc-acervo`
3. **Private** (recomendado — contém lógica de admin)
4. **Não** marque “Add README” (o projeto já tem ficheiros)
5. Clique **Create repository**

### 2.2 Ligar o projeto local ao remoto

Substitua `SEU_USUARIO` pelo seu utilizador GitHub:

```powershell
cd c:\tcc-acervo
git remote add origin https://github.com/SEU_USUARIO/tcc-acervo.git
git branch -M main
git push -u origin main
```

Se usar SSH:

```powershell
git remote add origin git@github.com:SEU_USUARIO/tcc-acervo.git
git push -u origin main
```

O GitHub pode pedir login (token pessoal ou GitHub CLI).

---

## Parte 3 — Configurar Supabase para produção

Antes do deploy, prepare o Supabase para o domínio Vercel.

### 3.1 URLs de autenticação

No painel Supabase: **Authentication → URL Configuration**

| Campo | Valor (exemplo) |
|-------|-----------------|
| **Site URL** | `https://tcc-acervo.vercel.app` (ou o domínio que a Vercel atribuir) |
| **Redirect URLs** | `https://tcc-acervo.vercel.app/auth/callback` |
| | `https://tcc-acervo.vercel.app/auth/reset-password` |
| | `http://localhost:3000/auth/callback` (manter para dev local) |

> Depois do primeiro deploy, copie o URL exato da Vercel (passo 5) e atualize aqui se for diferente.

### 3.2 SQL e Storage

Confirme que já executou:

1. `supabase/schema.sql`
2. `supabase/migrations/002_extended_features.sql`
3. Bucket **`tccs`** (privado)

### 3.3 Utilizador administrador

Em **Authentication → Users**, confirme o admin e na tabela `roles`:

```sql
insert into public.roles (user_id, role)
values ('UUID-DO-ADMIN', 'ADMIN')
on conflict (user_id) do update set role = excluded.role;
```

---

## Parte 4 — Deploy na Vercel

### 4.1 Importar o projeto

1. Aceda a [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository** → escolha `tcc-acervo`
3. Framework: **Next.js** (detetado automaticamente)
4. Root Directory: `.` (raiz)
5. **Não** altere Build Command (`npm run build`) nem Output Directory

### 4.2 Variáveis de ambiente

Em **Environment Variables**, adicione **todas** para os ambientes **Production** e **Preview**:

| Variável | Obrigatória | Exemplo / notas |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave **anon** (JWT `eyJ...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Chave **service_role** — só servidor |
| `NEXT_PUBLIC_SITE_URL` | Sim | `https://seu-projeto.vercel.app` (URL final do site) |
| `SESSION_SECRET` | Sim | 32+ caracteres hex (gerado no passo 1.2) |
| `NEXT_PUBLIC_MAX_PDF_MB` | Não | `20` (default) |

**Não adicione em produção:**

| Variável | Motivo |
|----------|--------|
| `SUPABASE_INSECURE_SSL` | Apenas desenvolvimento local |
| `.env.local` | Nunca na Vercel como ficheiro — use o formulário acima |

Copie os valores de **Supabase → Project Settings → API**.

### 4.3 Deploy

1. Clique **Deploy**
2. Aguarde o build (2–5 minutos na primeira vez)
3. Se falhar, abra **Build Logs** — erros comuns:
   - Variável em falta → adicionar em Settings → Environment Variables
   - `SESSION_SECRET` curto → mínimo 32 caracteres em produção

### 4.4 Domínio

Após sucesso, a Vercel mostra um URL tipo:

`https://tcc-acervo-xxxx.vercel.app`

1. Copie esse URL
2. Atualize `NEXT_PUBLIC_SITE_URL` na Vercel com esse valor exato
3. Atualize **Supabase → Redirect URLs** (passo 3.1)
4. **Redeploy**: Deployments → ⋮ no último deploy → **Redeploy**

Opcional: **Settings → Domains** para domínio próprio (ex.: `acervo.universidade.ao`).

---

## Parte 5 — Verificação pós-deploy

Checklist rápido:

- [ ] Página inicial `/` carrega e lista TCCs
- [ ] Login e logout funcionam
- [ ] `/admin` abre só com utilizador ADMIN
- [ ] Recuperação de senha (lembrar limite ~2 emails/h no plano free Supabase)
- [ ] Upload de PDF no admin (bucket `tccs` + service role)
- [ ] HTTPS ativo (cadeado no browser)

Teste de build local (opcional, igual à Vercel):

```powershell
cd c:\tcc-acervo
$env:NODE_ENV="production"
npm run build
```

---

## Parte 6 — Atualizações futuras

Fluxo habitual após alterações no código:

```powershell
cd c:\tcc-acervo
git add .
git commit -m "Descrição da alteração"
git push
```

A Vercel faz **deploy automático** a cada push na branch `main` (se ligou o repositório assim).

---

## Resolução de problemas

| Problema | Solução |
|----------|---------|
| Build falha com ESLint | Corrija os ficheiros indicados nos logs ou execute `npm run lint` localmente |
| `SESSION_SECRET obrigatório` | Defina `SESSION_SECRET` na Vercel (32+ chars) |
| Login ok mas admin não entra | Confirme role `ADMIN` em `public.roles` |
| Emails não chegam | Limite Supabase free; configure SMTP em Authentication → SMTP |
| Link de email inválido | `NEXT_PUBLIC_SITE_URL` e Redirect URLs no Supabase devem coincidir com o domínio Vercel |
| PDF não abre | Bucket `tccs` privado + `SUPABASE_SERVICE_ROLE_KEY` configurada |
| Erro 500 em produção | Vercel → Deployment → **Functions** / **Runtime Logs** |

---

## Ficheiros relevantes para deploy

| Ficheiro | Função |
|----------|--------|
| `package.json` | Scripts `build` / `start` |
| `next.config.ts` | Headers de segurança, CSP |
| `vercel.json` | Região de execução (`cdg1` — Europa) |
| `middleware.ts` | Proteção de rotas |
| `.env.example` | Modelo de variáveis (commitar no Git) |
| `.gitignore` | Exclui `.env.local` e `.vercel` |
| `instrucao.md` | Este guia |
| `seguranca.md` | Segurança em produção |

---

## Resumo em 6 comandos

```powershell
cd c:\tcc-acervo
git add .
git commit -m "Deploy produção Vercel"
git remote add origin https://github.com/SEU_USUARIO/tcc-acervo.git
git branch -M main
git push -u origin main
```

Depois: importar no [vercel.com/new](https://vercel.com/new), colar variáveis de ambiente, **Deploy**, atualizar Supabase URLs com o domínio final.
