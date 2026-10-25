import "server-only";
import { redirect } from "next/navigation";
import { getSessionAdmin, type AdminUser } from "./session";
import { ADMIN_LOGIN_PATH } from "./constants";

export type { AdminUser };
export { createSession, destroySession, getSessionAdmin, SESSION_COOKIE } from "./session";
export { hashPassword, verifyPassword } from "./password";
export { ADMIN_LOGIN_PATH };

/**
 * Resolve the signed-in admin for the current request.
 *
 * `use cache: private` reads cookies() and caches the result in the browser
 * only (never on the server), so it is safe for session-derived UI. A resolved
 * admin is cached; `redirect()` throws and is never cached.
 *
 * Must be rendered behind a <Suspense> boundary (Cache Components rule).
 */
export async function getCurrentAdmin(): Promise<AdminUser> {
  const admin = await getSessionAdmin();
  if (!admin) redirect(ADMIN_LOGIN_PATH);
  return admin;
}

/**
 * Authorize a Server Action / Route Handler. Never cached — every mutation
 * re-verifies the session against the DB (do not trust the client).
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getSessionAdmin();
  if (!admin) {
    // In a server action, redirect() behaves like a normal navigation.
    redirect(ADMIN_LOGIN_PATH);
  }
  return admin;
}
