import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

const ADMIN_PREFIX = "/admin";
const LOGIN_PATH = "/admin/login";

/**
 * Optimistic auth guard for the admin area (Next 16: proxy.ts replaces
 * middleware.ts). This only checks cookie *presence* — real validation
 * (session exists, not expired) happens server-side via getSessionAdmin()
 * in layouts and every Server Action. Never do slow/data work here.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // Already signed in and hitting the login page → send to dashboard.
  if (pathname === LOGIN_PATH && hasSession) {
    return NextResponse.redirect(new URL(ADMIN_PREFIX, request.url));
  }

  // Any other /admin route requires a session cookie to even attempt.
  if (pathname.startsWith(ADMIN_PREFIX) && pathname !== LOGIN_PATH && !hasSession) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
