import "server-only";
import { cookies } from "next/headers";
import { LANG_COOKIE, translate, type Lang, type TKey } from "@/lib/i18n";

export type Translator = ((key: TKey) => string) & { lang: Lang };

/**
 * Translator for admin server code (Server Actions, metadata, server pages).
 * Reads the same language cookie the storefront toggle writes, so the admin
 * follows the sidebar FR/ع switch. Falls back to French per key.
 * `.lang` exposes the resolved locale for APIs that need it (e.g. error
 * mapping), avoiding a second cookie read.
 */
export async function adminT(): Promise<Translator> {
  const lang: Lang = (await cookies()).get(LANG_COOKIE)?.value === "ar" ? "ar" : "fr";
  const t = ((key: TKey) => translate(lang, key)) as Translator;
  t.lang = lang;
  return t;
}
