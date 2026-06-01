import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { APP_RECOVERY_COOKIE, readRecoverySession } from "@/lib/auth/app-session";

export async function GET() {
  const cookieStore = await cookies();
  const recovery = await readRecoverySession(cookieStore.get(APP_RECOVERY_COOKIE)?.value);
  return NextResponse.json({ ready: Boolean(recovery) });
}
