import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_LOGIN_PATH, SESSION_COOKIE } from "@/lib/auth/constants";

/**
 * Auth gate for the admin surface.
 *
 * Runs on the Edge runtime before anything renders, so an unauthenticated
 * request never reaches an admin page — not even its prerendered shell.
 * Edge cannot load `pg`, so this only checks that the session cookie exists.
 * Validity is still re-verified against the database by `getCurrentAdmin()`
 * in the dashboard layout and `requireAdmin()` in every server action.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = request.cookies.has(SESSION_COOKIE);

  // The login page is always reachable. The login page component itself
  // verifies if the session is actually valid against the DB before redirecting to /admin.
  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  if (!signedIn) {
    const login = new URL(ADMIN_LOGIN_PATH, request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
