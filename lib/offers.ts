import type { Offer } from "@/lib/types";

/** Settings key holding homepage promo offers as a JSON array. */
export const OFFERS_KEY = "offers";

/** Hard cap so one admin cannot bloat the homepage payload. */
export const MAX_OFFERS = 8;

const MAX_LEN = { title: 120, text: 280, label: 40, href: 500 } as const;

/** Hard cap on hand-picked products per offer (payload safety). */
const MAX_TARGET_PRODUCTS = 50;

function clamp(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function href(value: unknown): string {
  const v = clamp(value, MAX_LEN.href);
  if (v.startsWith("/") || v.startsWith("https://") || v.startsWith("http://")) return v;
  return v ? `/${v.replace(/^#+/, "")}` : "";
}

function bool(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === "1";
}

/** Only #rgb / #rrggbb hex — anything else falls back to "". */
function hex(value: unknown): string {
  const v = typeof value === "string" ? value.trim() : "";
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v.toLowerCase() : "";
}

/** Font family choice — "" = theme default, else "display" (Prata) or "body" (Karla). */
function font(value: unknown): string {
  return value === "display" || value === "body" ? value : "";
}

function alignOf(value: unknown): Offer["align"] {
  return value === "center" || value === "end" ? value : "start";
}

function valignOf(value: unknown): Offer["valign"] {
  return value === "center" ? value : "bottom";
}

/** Offer targeting mode — anything unexpected falls back to "all". */
function targetOf(value: unknown): Offer["target_type"] {
  return value === "category" || value === "products" ? value : "all";
}

/** Tri-state visibility: missing field (old JSON) = shown, "false" = hidden. */
function vis(value: unknown): boolean {
  return value === undefined ? true : bool(value);
}

/** Clamp to an integer 0–max (default when missing/unparseable). */
function pct(value: unknown, fallback: number, max = 100): number {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? parseFloat(value)
        : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(0, Math.round(n))) : fallback;
}

let counter = 0;
export function newOfferId(): string {
  counter += 1;
  return `o${Date.now().toString(36)}${counter.toString(36)}`;
}

export function emptyOffer(): Offer {
  return {
    id: newOfferId(),
    title_fr: "",
    title_ar: "",
    text_fr: "",
    text_ar: "",
    image: "",
    discount_type: "percent",
    discount_value: 0,
    btn_label_fr: "",
    btn_label_ar: "",
    btn_href: "/shop",
    target_type: "all",
    target_category: "",
    target_products: [],
    starts_at: "",
    ends_at: "",
    active: true,
    show_on_home: true,
    show_title: true,
    show_text: true,
    show_btns: true,
    title_font: "",
    text_font: "",
    title_size: 0,
    text_size: 0,
    title_bold: true,
    title_underline: false,
    title_color: "",
    text_color: "",
    btn1_bg: "",
    btn1_color: "",
    bg_color: "",
    bg_opacity: 0,
    bg_shadow: "",
    bg_shadow_opacity: 0,
    align: "start",
    valign: "bottom",
  };
}
/** Coerce one raw JSON entry into a well-formed offer (or null if unusable). */
export function normalizeOffer(raw: unknown): Offer | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const title_fr = clamp(s.title_fr, MAX_LEN.title);
  const title_ar = clamp(s.title_ar, MAX_LEN.title);
  if (!title_fr && !title_ar) return null;
  const type = s.discount_type === "fixed" ? "fixed" : "percent";
  const value = pct(s.discount_value, 0, type === "percent" ? 100 : 1000000);
  const starts = typeof s.starts_at === "string" ? s.starts_at : "";
  const ends = typeof s.ends_at === "string" ? s.ends_at : "";
  return {
    id: clamp(s.id, 40) || newOfferId(),
    title_fr,
    title_ar,
    text_fr: clamp(s.text_fr, MAX_LEN.text),
    text_ar: clamp(s.text_ar, MAX_LEN.text),
    image: clamp(s.image, MAX_LEN.href),
    discount_type: type,
    discount_value: value,
    btn_label_fr: clamp(s.btn_label_fr, MAX_LEN.label),
    btn_label_ar: clamp(s.btn_label_ar, MAX_LEN.label),
    btn_href: href(s.btn_href),
    target_type: targetOf(s.target_type),
    target_category: clamp(s.target_category, 80),
    target_products: Array.isArray(s.target_products)
      ? s.target_products
          .filter((v): v is string => typeof v === "string")
          .map((v) => clamp(v, 80))
          .filter(Boolean)
          .slice(0, MAX_TARGET_PRODUCTS)
      : [],
    starts_at: starts,
    ends_at: ends,
    active: bool(s.active),
    show_on_home: vis(s.show_on_home),
    show_title: vis(s.show_title),
    show_text: vis(s.show_text),
    show_btns: vis(s.show_btns),
    title_font: font(s.title_font),
    text_font: font(s.text_font),
    title_size: s.title_size === undefined ? 0 : pct(s.title_size, 0, 80),
    text_size: s.text_size === undefined ? 0 : pct(s.text_size, 0, 48),
    title_bold: s.title_bold === undefined ? true : bool(s.title_bold),
    title_underline: bool(s.title_underline),
    title_color: hex(s.title_color),
    text_color: hex(s.text_color),
    btn1_bg: hex(s.btn1_bg),
    btn1_color: hex(s.btn1_color),
    bg_color: hex(s.bg_color),
    bg_opacity: pct(s.bg_opacity, 0),
    bg_shadow: hex(s.bg_shadow),
    bg_shadow_opacity: pct(s.bg_shadow_opacity, 0),
    align: alignOf(s.align),
    valign: valignOf(s.valign),
  };
}

/** Parse the settings value into a safe, capped offer list. */
export function parseOffers(raw: string | undefined | null): Offer[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const offers: Offer[] = [];
    for (const entry of data) {
      if (offers.length >= MAX_OFFERS) break;
      const offer = normalizeOffer(entry);
      if (offer) offers.push(offer);
    }
    return offers;
  } catch {
    return [];
  }
}

/** Public view: only active offers within their display window. */
export function activeOffers(offers: Offer[], now = new Date()): Offer[] {
  const today = now.toISOString().slice(0, 10);
  return offers.filter(
    (o) =>
      o.active &&
      (!o.starts_at || o.starts_at <= today) &&
      (!o.ends_at || o.ends_at >= today)
  );
}

/** Homepage view: active offers the admin chose to feature on the home page. */
export function homeOffers(offers: Offer[], now = new Date()): Offer[] {
  return activeOffers(offers, now).filter((o) => o.show_on_home);
}

/**
 * Where the storefront CTA should send visitors, based on the offer targeting:
 * a picked category → that category's shop page (auto-includes all its
 * products), hand-picked products → /shop?ids=…, otherwise the admin's
 * custom button link (default /shop).
 */
export function offerLink(offer: Offer): string {
  if (offer.target_type === "category" && offer.target_category) {
    return `/shop?cat=${encodeURIComponent(offer.target_category)}`;
  }
  if (offer.target_type === "products" && offer.target_products.length > 0) {
    return `/shop?ids=${encodeURIComponent(offer.target_products.join(","))}`;
  }
  return offer.btn_href || "/shop";
}
// __PART2__
