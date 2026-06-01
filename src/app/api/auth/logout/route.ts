import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  clearAuthCookies,
  clearLegacySupabaseCookies,
  collectSupabaseCookieNames,
} from "@/lib/auth/cookies";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);

  const cookieStore = await cookies();
  clearLegacySupabaseCookies(res, collectSupabaseCookieNames(cookieStore.getAll()));

  return res;
}
