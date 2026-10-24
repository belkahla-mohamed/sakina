import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { q, q1 } from "./pool";

export interface SettingsMap {
  [key: string]: string;
}

export const DEFAULT_SETTINGS: SettingsMap = {
  whatsapp: "212608308484",
  free_shipping_from: "300",
  delivery_casablanca: "20",
  delivery_outside: "35",
  announce_hidden: "0",
  announce_fr:
    "Livraison gratuite dès 300 DH · Paiement à la livraison · Retour sous 7 jours",
  announce_ar:
    "التوصيل مجاني ابتداءً من 300 درهم · الدفع عند الاستلام · إرجاع خلال 7 أيام",
  site_name: "Sakina",
  site_name_ar: "ساكينا",
  social_instagram: "",
  social_tiktok: "",
  social_facebook: "",
};

/** Cached settings map. Falls back to defaults if the DB is unreachable. */
export async function dbSettings(): Promise<SettingsMap> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  try {
    const rows = await q<{ key: string; value: string }>(
      "select key, value from public.settings"
    );
    if (rows.length === 0) return DEFAULT_SETTINGS;
    const map: SettingsMap = { ...DEFAULT_SETTINGS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Fresh (uncached) settings for the admin panel. */
export async function dbAdminSettings(): Promise<SettingsMap> {
  try {
    const rows = await q<{ key: string; value: string }>(
      "select key, value from public.settings order by key"
    );
    const map: SettingsMap = { ...DEFAULT_SETTINGS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function dbUpsertSetting(key: string, value: string): Promise<void> {
  await q(
    `insert into public.settings (key, value, updated_at) values ($1, $2, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [key, value]
  );
}

export async function dbGetSetting(key: string): Promise<string | null> {
  const row = await q1<{ value: string }>(
    "select value from public.settings where key = $1",
    [key]
  );
  return row?.value ?? null;
}
