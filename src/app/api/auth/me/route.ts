import { NextResponse } from "next/server";
import { getCurrentRole } from "@/lib/auth";
import { getServerAuth } from "@/lib/supabase/session";

export async function GET() {
  const { user } = await getServerAuth();

  if (!user) return NextResponse.json({ user: null, role: null });

  const role = await getCurrentRole();

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    role,
  });
}

