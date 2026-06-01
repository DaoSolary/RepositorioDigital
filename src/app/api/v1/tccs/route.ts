import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { fetchTccs, toPublicTcc } from "@/lib/tccs";
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

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? undefined;
  const curso = searchParams.get("curso") ?? undefined;
  const ano = searchParams.get("ano") ? Number(searchParams.get("ano")) : undefined;
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 20), 50);

  const result = await fetchTccs({ q, curso, ano, page, pageSize });

  return NextResponse.json({
    api_version: "1.0",
    ...result,
    items: result.items.map(toPublicTcc),
  });
}
