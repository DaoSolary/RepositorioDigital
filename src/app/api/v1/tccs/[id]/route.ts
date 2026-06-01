import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { fetchTccById, toPublicTcc } from "@/lib/tccs";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { rateLimitResponse } from "@/lib/security/api-guard";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const key = req.headers.get("x-api-key");
  const apiKey = await validateApiKey(key);
  if (!apiKey) {
    return NextResponse.json({ error: "API key inválida ou ausente." }, { status: 401 });
  }

  const limited = checkRateLimit(`v1:${apiKey.id}`, { windowSec: 60, max: 120 });
  if (!limited.allowed) return rateLimitResponse(limited);

  const { id: rawId } = await params;
  const parsedId = uuidSchema.safeParse(rawId);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }
  const id = parsedId.data;
  const tcc = await fetchTccById(id);
  if (!tcc) return NextResponse.json({ error: "TCC não encontrado." }, { status: 404 });

  return NextResponse.json({ api_version: "1.0", data: toPublicTcc(tcc) });
}
