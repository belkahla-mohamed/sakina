import "server-only";
import { cookies } from "next/headers";

/**
 * Carry a message across a `redirect()`.
 *
 * `redirect()` throws, so a Server Action that redirects can never hand its
 * result back through `useActionState`. Stashing the message in a cookie lets
 * the dashboard show the toast after the destination page mounts.
 *
 * Not `httpOnly`: it only carries a UI hint, and the client must read it.
 */
export const FLASH_COOKIE = "sakina_flash";

export interface Flash {
  kind: "success" | "error";
  title: string;
  solution?: string;
}

export async function setFlash(flash: Flash): Promise<void> {
  const store = await cookies();
  store.set(FLASH_COOKIE, JSON.stringify(flash), {
    path: "/",
    maxAge: 60,
  });
}
