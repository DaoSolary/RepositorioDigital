import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { issueAppSessionToken } from "@/lib/auth/issue-session";
import { attachRecoveryCookie } from "@/lib/auth/recovery-session";
import {
  clearLegacySupabaseCookies,
  collectSupabaseCookieNames,
  setAppSessionCookie,
} from "@/lib/auth/cookies";
import { exchangeCodeForSession } from "@/lib/auth/supabase-auth-api";
import { logActivity, getRequestMeta } from "@/lib/activity";
import { safeRedirectPath } from "@/lib/security/safe-redirect";

function withClearedLegacyCookies(res: NextResponse) {
  return cookies().then((store) => {
    clearLegacySupabaseCookies(res, collectSupabaseCookieNames(store.getAll()));
    return res;
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";
  const type = url.searchParams.get("type");
  const origin = url.origin;

  // Tokens no hash (#access_token) não chegam ao servidor — o browser resolve na ponte.
  if (!code) {
    return new NextResponse(callbackBridgeHtml(), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  if (type === "recovery") {
    const destination = new URL("/auth/reset-password", origin);

    const { data, error } = await exchangeCodeForSession(code);
    if (error || !data) {
      destination.searchParams.set("error", "Link inválido ou expirado. Solicite um novo email.");
      return NextResponse.redirect(destination.toString());
    }

    const res = NextResponse.redirect(destination.toString());
    await attachRecoveryCookie(res, data.user.id, data.accessToken);
    return withClearedLegacyCookies(res);
  }

  const { data, error } = await exchangeCodeForSession(code);

  if (error || !data) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Link inválido ou expirado. Solicite um novo email.")}`,
    );
  }

  const meta = getRequestMeta(request);
  await logActivity({
    userId: data.user.id,
    action: "login",
    metadata: { flow: "email_confirm" },
    ...meta,
  }).catch(() => null);

  const sessionToken = await issueAppSessionToken(data.user.id, data.user.email);
  const safeNext = safeRedirectPath(next);
  const res = NextResponse.redirect(`${origin}${safeNext}`);
  setAppSessionCookie(res, sessionToken);
  return withClearedLegacyCookies(res);
}

/** Encaminha recuperação (hash) para /auth/reset-password; demais fluxos sem code → login. */
function callbackBridgeHtml(): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redirecionando…</title>
</head>
<body>
  <p style="font-family:system-ui,sans-serif;text-align:center;margin-top:2rem;color:#52525b">
    Validando link…
  </p>
  <script>
    (function () {
      var h = new URLSearchParams(window.location.hash.slice(1));
      var q = new URLSearchParams(window.location.search);
      if (h.get("type") === "recovery" || q.get("type") === "recovery") {
        window.location.replace("/auth/reset-password" + window.location.search + window.location.hash);
      } else {
        window.location.replace("/login?error=auth_callback");
      }
    })();
  </script>
</body>
</html>`;
}
