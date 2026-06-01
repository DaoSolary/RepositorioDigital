import type { AppRole } from "@/lib/auth";
import { createAppSessionToken } from "@/lib/auth/app-session";
import { lookupUserRole } from "@/lib/roles";

export async function issueAppSessionToken(
  userId: string,
  email?: string,
): Promise<string> {
  const role: AppRole = (await lookupUserRole(userId)) ?? "USER";
  return createAppSessionToken(userId, email, role);
}
