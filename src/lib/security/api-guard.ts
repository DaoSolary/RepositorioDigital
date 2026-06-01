import { NextResponse } from "next/server";
import { rateLimitForRequest, type RateLimitConfig, type RateLimitResult } from "@/lib/security/rate-limit";

export const AUTH_RATE_LIMITS = {
  login: { windowSec: 15 * 60, max: 10 },
  signup: { windowSec: 60 * 60, max: 5 },
  email: { windowSec: 60 * 60, max: 5 },
  recoverySetup: { windowSec: 60 * 60, max: 15 },
} as const satisfies Record<string, RateLimitConfig>;

export function rateLimitResponse(result: Extract<RateLimitResult, { allowed: false }>) {
  return NextResponse.json(
    { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSec) },
    },
  );
}

export function enforceRateLimit(
  req: Request,
  scope: keyof typeof AUTH_RATE_LIMITS,
): NextResponse | null {
  const result = rateLimitForRequest(req, `auth:${scope}`, AUTH_RATE_LIMITS[scope]);
  if (!result.allowed) return rateLimitResponse(result);
  return null;
}
