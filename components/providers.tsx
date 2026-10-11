"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { dict, formatPrice, translate, LANG_COOKIE, type Lang, type TKey } from "@/lib/i18n";
import { SITE, type PublicSettings } from "@/lib/config";

const CART_KEY = "sakina_cart_v1";
const FAVS_KEY = "sakina_favs_v1";
const LOCAL_EVENT = "sakina-store";

function subscribe(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(LOCAL_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(LOCAL_EVENT, handler);
  };
}

function readStore(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

function parseCart(raw: string | null): CartEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (e): e is CartEntry =>
            typeof e?.slug === "string" && typeof e?.qty === "number" && e.qty > 0
        )
      : [];
  } catch {
    return [];
  }
}

function parseFavs(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === "string")
      : [];
  } catch {
    return [];
  }
}

/* ---------------- Language ---------------- */

interface LangValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  format: (value: number) => string;
}

const LangContext = createContext<LangValue | null>(null);

/* ---------------- Cart ---------------- */

export interface CartEntry {
  slug: string;
  qty: number;
}

interface CartValue {
  entries: CartEntry[];
  count: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);

/* ---------------- Favorites ---------------- */

interface FavsValue {
  slugs: string[];
  count: number;
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
}

const FavsContext = createContext<FavsValue | null>(null);

/* ---------------- Store settings (DB-backed, injected by the root layout) --- */

/** Client-side fallback used if the layout could not resolve DB settings. */
const DEFAULT_SETTINGS: PublicSettings = {
  whatsapp: SITE.whatsapp,
  freeShippingFrom: SITE.freeShippingFrom,
  announce_fr:
    "Livraison gratuite dès 300 DH · Paiement à la livraison · Retour sous 7 jours",
  announce_ar:
    "التوصيل مجاني ابتداءً من 300 درهم · الدفع عند الاستلام · إرجاع خلال 7 أيام",
  site_name: SITE.name,
  site_name_ar: SITE.name_ar,
};

const SettingsContext = createContext<PublicSettings | null>(null);

export function Providers({
  children,
  initialLang,
  settings,
}: {
  children: ReactNode;
  initialLang?: Lang;
  settings?: PublicSettings;
}) {
  const storedLang = useSyncExternalStore(
    subscribe,
    () => readStore(LANG_COOKIE),
    () => initialLang ?? null
  );
  const storedCart = useSyncExternalStore(
    subscribe,
    () => readStore(CART_KEY),
    () => null
  );
  const storedFavs = useSyncExternalStore(
    subscribe,
    () => readStore(FAVS_KEY),
    () => null
  );

  const lang: Lang =
    storedLang === "ar" || storedLang === "fr" ? storedLang : initialLang ?? "fr";
  const entries = useMemo(() => parseCart(storedCart), [storedCart]);
  const favSlugs = useMemo(() => parseFavs(storedFavs), [storedFavs]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  }, [lang]);

  const setLang = useCallback((next: Lang) => writeStore(LANG_COOKIE, next), []);

  const persistEntries = useCallback((next: CartEntry[]) => {
    writeStore(CART_KEY, JSON.stringify(next));
  }, []);

  const add = useCallback(
    (slug: string, qty = 1) => {
      const found = entries.find((e) => e.slug === slug);
      const next = found
        ? entries.map((e) => (e.slug === slug ? { ...e, qty: e.qty + qty } : e))
        : [...entries, { slug, qty }];
      persistEntries(next);
    },
    [entries, persistEntries]
  );

  const setQty = useCallback(
    (slug: string, qty: number) => {
      const next =
        qty <= 0
          ? entries.filter((e) => e.slug !== slug)
          : entries.map((e) => (e.slug === slug ? { ...e, qty } : e));
      persistEntries(next);
    },
    [entries, persistEntries]
  );

  const remove = useCallback(
    (slug: string) => {
      persistEntries(entries.filter((e) => e.slug !== slug));
    },
    [entries, persistEntries]
  );

  const clear = useCallback(() => persistEntries([]), [persistEntries]);

  const toggleFav = useCallback(
    (slug: string) => {
      const next = favSlugs.includes(slug)
        ? favSlugs.filter((s) => s !== slug)
        : [...favSlugs, slug];
      writeStore(FAVS_KEY, JSON.stringify(next));
    },
    [favSlugs]
  );

  const langValue = useMemo<LangValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      t: (key: TKey) => translate(lang, key),
      format: (value: number) => formatPrice(value, lang),
    }),
    [lang, setLang]
  );

  const cartValue = useMemo<CartValue>(
    () => ({
      entries,
      count: entries.reduce((sum, e) => sum + e.qty, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [entries, add, setQty, remove, clear]
  );

  const favsValue = useMemo<FavsValue>(
    () => ({
      slugs: favSlugs,
      count: favSlugs.length,
      has: (slug: string) => favSlugs.includes(slug),
      toggle: toggleFav,
    }),
    [favSlugs, toggleFav]
  );

  return (
    <SettingsContext.Provider value={settings ?? DEFAULT_SETTINGS}>
      <LangContext.Provider value={langValue}>
        <CartContext.Provider value={cartValue}>
          <FavsContext.Provider value={favsValue}>{children}</FavsContext.Provider>
        </CartContext.Provider>
      </LangContext.Provider>
    </SettingsContext.Provider>
  );
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <Providers>");
  return ctx;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <Providers>");
  return ctx;
}

export function useFavs(): FavsValue {
  const ctx = useContext(FavsContext);
  if (!ctx) throw new Error("useFavs must be used inside <Providers>");
  return ctx;
}

export function useSettings(): PublicSettings {
  return useContext(SettingsContext) ?? DEFAULT_SETTINGS;
}

export function useDict() {
  const { lang, t } = useLang();
  return { lang, t, dict: dict[lang] };
}
