import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { fetchPublicStats } from "@/lib/stats";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { rateLimitResponse } from "@/lib/security/api-guard";

export async function GET(req: Request) {
  const key = req.headers.get("x-api-key");
  const apiKey = await validateApiKey(key);
  if (!apiKey) {
    return NextResponse.json({ error: "API key inválida ou ausente." }, { status: 401 });
  }

  const limited = checkRateLimit(`v1:${apiKey.id}`, { windowSec: 60, max: 120 });
  if (!limited.allowed) return rateLimitResponse(limited);

  const stats = await fetchPublicStats();
  return NextResponse.json({
    api_version: "1.0",
    generated_at: new Date().toISOString(),
    data: stats,
  });
}
