import { getClientIp } from "@/lib/security/request";

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export type RateLimitConfig = {
  /** Janela em segundos */
  windowSec: number;
  /** Máximo de pedidos por janela */
  max: number;
};

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSec: number };

function pruneExpired(now: number) {
  if (store.size < 5000) return;
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  pruneExpired(now);

  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + config.windowSec * 1000 });
    return { allowed: true };
  }

  if (bucket.count >= config.max) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function rateLimitForRequest(
  req: Request,
  scope: string,
  config: RateLimitConfig,
): RateLimitResult {
  const ip = getClientIp(req);
  return checkRateLimit(`${scope}:${ip}`, config);
}
