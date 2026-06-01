import { env } from "@/lib/env";

type AuthUser = {
  id: string;
  email?: string;
};

type AuthResult<T> = { data: T | null; error: string | null };

function authHeaders() {
  return {
    apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  };
}

async function parseAuthResponse(res: Response) {
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const msg =
      (typeof json.msg === "string" && json.msg) ||
      (typeof json.error_description === "string" && json.error_description) ||
      (typeof json.error === "string" && json.error) ||
      "Erro de autenticação.";
    return { ok: false as const, error: msg, json };
  }
  return { ok: true as const, error: null, json };
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthResult<{ user: AuthUser; accessToken: string }>> {
  const res = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    },
  );

  const parsed = await parseAuthResponse(res);
  if (!parsed.ok) return { data: null, error: parsed.error };

  const user = parsed.json.user as AuthUser | undefined;
  const accessToken = parsed.json.access_token as string | undefined;
  if (!user?.id || !accessToken) {
    return { data: null, error: "Resposta de login inválida." };
  }

  return { data: { user, accessToken }, error: null };
}

export async function exchangeCodeForSession(
  code: string,
): Promise<AuthResult<{ user: AuthUser; accessToken: string }>> {
  const res = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=pkce`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ auth_code: code }),
      cache: "no-store",
    },
  );

  const parsed = await parseAuthResponse(res);
  if (!parsed.ok) return { data: null, error: parsed.error };

  const user = parsed.json.user as AuthUser | undefined;
  const accessToken = parsed.json.access_token as string | undefined;
  if (!user?.id || !accessToken) {
    return { data: null, error: "Link inválido ou expirado." };
  }

  return { data: { user, accessToken }, error: null };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  emailRedirectTo: string,
): Promise<AuthResult<{ user: AuthUser | null; needsEmailConfirmation: boolean }>> {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      email,
      password,
      data: {},
      options: { emailRedirectTo },
    }),
    cache: "no-store",
  });

  const parsed = await parseAuthResponse(res);
  if (!parsed.ok) return { data: null, error: parsed.error };

  const user = (parsed.json.user as AuthUser | undefined) ?? null;
  const accessToken = parsed.json.access_token as string | undefined;

  return {
    data: {
      user,
      needsEmailConfirmation: !accessToken,
    },
    error: null,
  };
}

export async function resetPasswordForEmail(email: string, redirectTo: string) {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, redirect_to: redirectTo }),
    cache: "no-store",
  });

  const parsed = await parseAuthResponse(res);
  return { error: parsed.ok ? null : parsed.error };
}

export async function resendSignupEmail(email: string, emailRedirectTo: string) {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/resend`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      type: "signup",
      email,
      options: { emailRedirectTo },
    }),
    cache: "no-store",
  });

  const parsed = await parseAuthResponse(res);
  return { error: parsed.ok ? null : parsed.error };
}

export async function getUserFromAccessToken(
  accessToken: string,
): Promise<AuthResult<AuthUser>> {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    method: "GET",
    headers: {
      ...authHeaders(),
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  const parsed = await parseAuthResponse(res);
  if (!parsed.ok) return { data: null, error: parsed.error };

  const user = parsed.json as unknown as AuthUser;
  if (!user?.id) {
    return { data: null, error: "Token inválido ou expirado." };
  }

  return { data: user, error: null };
}

export async function updateUserPassword(accessToken: string, password: string) {
  const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password }),
    cache: "no-store",
  });

  const parsed = await parseAuthResponse(res);
  return { error: parsed.ok ? null : parsed.error };
}
