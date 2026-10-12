import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { q1, q } from "@/lib/db/pool";
import { SESSION_COOKIE, SESSION_TTL_DAYS } from "./constants";

export { SESSION_COOKIE };

export interface AdminUser {
  id: number;
  email: string;
  name: string | null;
}

interface SessionRow {
  id: string;
  admin_id: number;
  email: string;
  name: string | null;
  expires_at: Date;
}

/**
 * Create a new session for an admin and set the HTTP-only cookie.
 * Call from a Server Action / Route Handler (cookies() must be writable).
 */
export async function createSession(admin: AdminUser): Promise<void> {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400_000);

  await q(
    `insert into public.admin_sessions (id, admin_id, expires_at) values ($1,$2,$3)`,
    [id, admin.id, expiresAt]
  );
  // opportunistic cleanup
  await q("delete from public.admin_sessions where expires_at < now()").catch(
    () => undefined
  );

  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Validate the session cookie against the DB.
 * Reads cookies() → must NOT run inside a plain `use cache` scope.
 * Use inside `use cache: private`, a Server Action, or a request-time component.
 */
export async function getSessionAdmin(): Promise<AdminUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const row = await q1<SessionRow>(
    `select s.id, s.admin_id, s.expires_at, u.email, u.name
       from public.admin_sessions s
       join public.admin_users u on u.id = s.admin_id
      where s.id = $1 and s.expires_at > now()`,
    [token]
  );
  if (!row) return null;
  return { id: row.admin_id, email: row.email, name: row.name };
}

/** Delete the current session row and clear the cookie. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await q("delete from public.admin_sessions where id = $1", [token]).catch(
      () => undefined
    );
  }
  store.delete(SESSION_COOKIE);
}
