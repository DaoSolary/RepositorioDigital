import { NextResponse } from "next/server";
import {
  APP_RECOVERY_COOKIE,
  APP_SESSION_COOKIE,
  appRecoveryMaxAge,
  appSessionMaxAge,
} from "@/lib/auth/app-session";

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAppSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(APP_SESSION_COOKIE, token, {
    ...baseCookie,
    maxAge: appSessionMaxAge,
  });
}

export function setRecoveryCookie(response: NextResponse, token: string) {
  response.cookies.set(APP_RECOVERY_COOKIE, token, {
    ...baseCookie,
    maxAge: appRecoveryMaxAge,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(APP_SESSION_COOKIE, "", { ...baseCookie, maxAge: 0 });
  response.cookies.set(APP_RECOVERY_COOKIE, "", { ...baseCookie, maxAge: 0 });
}

/** Remove cookies legados do Supabase Auth (causam refresh_token_already_used). */
export function clearLegacySupabaseCookies(
  response: NextResponse,
  cookieNames: string[],
) {
  for (const name of cookieNames) {
    if (name.startsWith("sb-")) {
      response.cookies.set(name, "", { ...baseCookie, maxAge: 0 });
    }
  }
}

export function collectSupabaseCookieNames(
  cookies: { name: string }[],
): string[] {
  return cookies.filter((c) => c.name.startsWith("sb-")).map((c) => c.name);
}
