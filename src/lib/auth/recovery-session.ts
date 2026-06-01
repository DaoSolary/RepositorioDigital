import { NextResponse } from "next/server";
import { createRecoveryToken } from "@/lib/auth/app-session";
import { setRecoveryCookie } from "@/lib/auth/cookies";

export async function attachRecoveryCookie(
  response: NextResponse,
  userId: string,
  accessToken: string,
): Promise<void> {
  const token = await createRecoveryToken(userId, accessToken);
  setRecoveryCookie(response, token);
}
