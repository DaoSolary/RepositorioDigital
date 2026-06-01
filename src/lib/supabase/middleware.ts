import { NextResponse, type NextRequest } from "next/server";
import { APP_SESSION_COOKIE, readAppSession } from "@/lib/auth/app-session";

const USER_ID_HEADER = "x-user-id";

/** Propaga user id do cookie app_session — sem Supabase Auth. */
export async function updateSession(request: NextRequest) {
  const session = await readAppSession(request.cookies.get(APP_SESSION_COOKIE)?.value);
  const requestHeaders = new Headers(request.headers);

  if (session) {
    requestHeaders.set(USER_ID_HEADER, session.uid);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}
