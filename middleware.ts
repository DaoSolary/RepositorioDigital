import "@/lib/supabase/dev-tls";
import { NextResponse, type NextRequest } from "next/server";
import { APP_SESSION_COOKIE, readAppSession } from "@/lib/auth/app-session";

const USER_ID_HEADER = "x-user-id";

function stripLegacySupabaseCookies(
  request: NextRequest,
  response: NextResponse,
) {
  for (const c of request.cookies.getAll()) {
    if (c.name.startsWith("sb-")) {
      response.cookies.set(c.name, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await readAppSession(request.cookies.get(APP_SESSION_COOKIE)?.value);
  const user = session ? { id: session.uid, email: session.email } : null;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(USER_ID_HEADER);
  if (user) {
    requestHeaders.set(USER_ID_HEADER, user.id);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  stripLegacySupabaseCookies(request, response);

  const isAdminApi = pathname.startsWith("/api/admin");
  const isAdminPage =
    pathname.startsWith("/admin") ||
    pathname === "/estatisticas" ||
    pathname.startsWith("/estatisticas/") ||
    pathname === "/api-docs" ||
    pathname.startsWith("/api-docs/");

  const isAccountPage = pathname.startsWith("/account");
  const isAccountApi = pathname.startsWith("/api/account");

  if ((isAdminPage || isAdminApi) && !user) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if ((isAccountPage || isAccountApi) && !user) {
    if (isAccountApi) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (!user) {
    return response;
  }

  // Role no JWT (após login). Sem role no token, layout/API validam no Node com service role.
  if ((isAdminPage || isAdminApi) && session?.role && session.role !== "ADMIN") {
    if (isAdminApi) {
      return NextResponse.json({ error: "Proibido." }, { status: 403 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
