export const APP_SESSION_COOKIE = "app_session";
export const APP_RECOVERY_COOKIE = "app_recovery";

export const appSessionMaxAge = 60 * 60 * 24 * 7;
export const appRecoveryMaxAge = 60 * 30;

export type AppSessionRole = "ADMIN" | "USER";

export type AppSessionPayload = {
  uid: string;
  email?: string;
  role?: AppSessionRole;
  exp: number;
};

export type AppRecoveryPayload = {
  uid: string;
  accessToken: string;
  exp: number;
};

function getSecret(): string {
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (process.env.NODE_ENV === "production") {
    if (!sessionSecret || sessionSecret.length < 32) {
      throw new Error(
        "SESSION_SECRET obrigatório em produção (mínimo 32 caracteres aleatórios).",
      );
    }
    return sessionSecret;
  }

  const secret =
    sessionSecret ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!secret) {
    throw new Error("Defina SESSION_SECRET no .env.local");
  }
  return secret;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(payload: object): Promise<string> {
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)).buffer as ArrayBuffer);
  const key = await hmacKey();
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${toBase64Url(sigBuf)}`;
}

async function verifyPayload<T extends { exp: number }>(
  token: string | undefined | null,
): Promise<T | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  try {
    const key = await hmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      new Uint8Array(fromBase64Url(sig)),
      new TextEncoder().encode(body),
    );
    if (!valid) return null;

    const json = new TextDecoder().decode(fromBase64Url(body));
    const payload = JSON.parse(json) as T;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createAppSessionToken(
  uid: string,
  email?: string,
  role?: AppSessionRole,
): Promise<string> {
  return signPayload({
    uid,
    email,
    ...(role ? { role } : {}),
    exp: Math.floor(Date.now() / 1000) + appSessionMaxAge,
  });
}

export async function readAppSession(
  token: string | undefined | null,
): Promise<AppSessionPayload | null> {
  return verifyPayload<AppSessionPayload>(token);
}

export async function createRecoveryToken(
  uid: string,
  accessToken: string,
): Promise<string> {
  return signPayload({
    uid,
    accessToken,
    exp: Math.floor(Date.now() / 1000) + appRecoveryMaxAge,
  });
}

export async function readRecoverySession(
  token: string | undefined | null,
): Promise<AppRecoveryPayload | null> {
  return verifyPayload<AppRecoveryPayload>(token);
}
