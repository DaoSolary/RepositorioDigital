# Modelos de email em português (Supabase)

No painel Supabase: **Authentication → Email Templates**

Adicione estas URLs em **Redirect URLs** (se ainda não existirem):

- `http://localhost:3000/auth/callback`
- `https://SEU_DOMINIO/auth/callback`

---

## Recuperação de senha (Reset Password)

**Subject:**

```
Redefinir senha — Acervo Digital de TCC
```

**Body (HTML):**

```html
<h2>Redefinir sua senha</h2>
<p>Olá,</p>
<p>Recebemos um pedido para redefinir a senha da sua conta no <strong>Acervo Digital de TCC</strong> da Universidade Kimpa Vita.</p>
<p>Clique no botão abaixo para criar uma nova senha. Este link é válido por tempo limitado.</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Redefinir senha</a></p>
<p>Se o botão não funcionar, copie e cole este endereço no navegador:</p>
<p style="word-break:break-all;font-size:12px;color:#52525b;">{{ .ConfirmationURL }}</p>
<p>Se você não solicitou esta alteração, ignore este email — sua senha permanecerá a mesma.</p>
<p style="font-size:12px;color:#71717a;">Universidade Kimpa Vita · Biblioteca Digital</p>
```

---

## Confirmação de cadastro (Confirm signup)

**Subject:**

```
Confirme seu email — Acervo Digital de TCC
```

**Body (HTML):**

```html
<h2>Bem-vindo(a) ao acervo!</h2>
<p>Obrigado por se cadastrar no <strong>Acervo Digital de TCC</strong>.</p>
<p>Confirme seu endereço de email clicando no link abaixo:</p>
<p><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:12px 24px;background:#18181b;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">Confirmar email</a></p>
<p style="font-size:12px;color:#71717a;">Universidade Kimpa Vita</p>
```

---

## Observação técnica

O link de recuperação deve passar por `/auth/callback` antes de `/auth/reset-password` (já configurado no app). O template usa `{{ .ConfirmationURL }}` gerado pelo Supabase com o `redirectTo` definido na API.
