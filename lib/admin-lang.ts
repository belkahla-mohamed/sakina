import "server-only";
import { cookies } from "next/headers";
import { LANG_COOKIE, translate, type TKey } from "@/lib/i18n";

/**
 * Translator for admin server code (Server Actions, metadata, server pages).
 * Reads the same language cookie the storefront toggle writes, so the admin
 * follows the sidebar FR/ع switch. Falls back to French per key.
 */
export async function adminT(): Promise<(key: TKey) => string> {
  const lang = (await cookies()).get(LANG_COOKIE)?.value === "ar" ? "ar" : "fr";
  return (key: TKey) => translate(lang, key);
}
