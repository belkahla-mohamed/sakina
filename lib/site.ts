import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { dbSettings } from "@/lib/db/settings";
import { SITE, type PublicSettings } from "@/lib/config";
import { parseSlides, activeSlides, HERO_SLIDES_KEY } from "@/lib/hero-slides";
import { OFFERS_KEY, parseOffers, activeOffers, homeOffers } from "@/lib/offers";
import type { HeroSlide, Offer } from "@/lib/types";

export type { PublicSettings };

export const FALLBACK_SETTINGS: PublicSettings = {
  whatsapp: SITE.whatsapp,
  freeShippingFrom: SITE.freeShippingFrom,
  deliveryCasablanca: SITE.deliveryCasablanca,
  deliveryOutside: SITE.deliveryOutside,
  announceHidden: SITE.announceHidden,
  announce_fr:
    "Livraison gratuite dès 300 DH · Paiement à la livraison · Retour sous 7 jours",
  announce_ar:
    "التوصيل مجاني ابتداءً من 300 درهم · الدفع عند الاستلام · إرجاع خلال 7 أيام",
  site_name: SITE.name,
  site_name_ar: SITE.name_ar,
  social_instagram: "",
  social_tiktok: "",
  social_facebook: "",
};

function toInt(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Merged public settings. Cached (tagged "settings") so an admin save +
 * revalidation refreshes every consumer at once. Never throws: the shop keeps
 * working from FALLBACK_SETTINGS if the DB is unreachable.
 */
export async function getPublicSettings(): Promise<PublicSettings> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  try {
    const map = await dbSettings();
    return {
      whatsapp: map.whatsapp || FALLBACK_SETTINGS.whatsapp,
      freeShippingFrom: toInt(map.free_shipping_from, FALLBACK_SETTINGS.freeShippingFrom),
      deliveryCasablanca: toInt(
        map.delivery_casablanca,
        FALLBACK_SETTINGS.deliveryCasablanca
      ),
      deliveryOutside: toInt(
        map.delivery_outside,
        FALLBACK_SETTINGS.deliveryOutside
      ),
      announceHidden: map.announce_hidden !== "0",
      announce_fr: map.announce_fr || FALLBACK_SETTINGS.announce_fr,
      announce_ar: map.announce_ar || FALLBACK_SETTINGS.announce_ar,
      site_name: map.site_name || FALLBACK_SETTINGS.site_name,
      site_name_ar: map.site_name_ar || FALLBACK_SETTINGS.site_name_ar,
      social_instagram: map.social_instagram || "",
      social_tiktok: map.social_tiktok || "",
      social_facebook: map.social_facebook || "",
    };
  } catch {
    return FALLBACK_SETTINGS;
  }
}

/** Product-card photo auto-rotation. Cached with settings; defaults to ON. */
export async function getProductRotation(): Promise<boolean> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  try {
    const map = await dbSettings();
    return (map.product_rotation ?? "1") !== "0";
  } catch {
    return true;
  }
}

/** Active homepage slider slides. Cached with settings so admin saves show up now. */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  try {
    const map = await dbSettings();
    return activeSlides(parseSlides(map[HERO_SLIDES_KEY]));
  } catch {
    return [];
  }
}

/** All active offers (display window respected) — used by the /offres page. */
export async function getOffers(): Promise<Offer[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  try {
    const map = await dbSettings();
    return activeOffers(parseOffers(map[OFFERS_KEY]));
  } catch {
    return [];
  }
}

/** Active offers the admin chose to feature on the homepage (may be empty). */
export async function getHomeOffers(): Promise<Offer[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("settings");
  try {
    const map = await dbSettings();
    return homeOffers(parseOffers(map[OFFERS_KEY]));
  } catch {
    return [];
  }
}
