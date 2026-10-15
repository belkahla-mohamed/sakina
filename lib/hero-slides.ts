import type { HeroSlide } from "@/lib/types";

/** Settings key holding the homepage slider as a JSON array. */
export const HERO_SLIDES_KEY = "hero_slides";

/** Hard cap so one admin cannot bloat the homepage payload. */
export const MAX_SLIDES = 8;

const MAX_LEN = { title: 120, text: 280, label: 40, href: 500 } as const;

function clamp(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function href(value: unknown): string {
  const v = clamp(value, MAX_LEN.href);
  // Only internal paths or absolute http(s) links — blocks javascript: etc.
  if (v.startsWith("/") || v.startsWith("https://") || v.startsWith("http://")) return v;
  return v ? `/${v.replace(/^#+/, "")}` : "";
}

function bool(value: unknown): boolean {
  return value === true || value === "true" || value === "on" || value === "1";
}

/** Only #rgb / #rrggbb hex — anything else falls back to the default (white). */
function hex(value: unknown): string {
  const v = typeof value === "string" ? value.trim() : "";
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v.toLowerCase() : "";
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
export function newSlideId(): string {
  counter += 1;
  return `s${Date.now().toString(36)}${counter.toString(36)}`;
}

export function emptySlide(): HeroSlide {
  return {
    id: newSlideId(),
    image: "",
    title_fr: "",
    title_ar: "",
    text_fr: "",
    text_ar: "",
    title_color: "",
    text_color: "",
    overlay: 100,
    btn_label_fr: "",
    btn_label_ar: "",
    btn_href: "/shop",
    btn2_label_fr: "",
    btn2_label_ar: "",
    btn2_href: "",
    active: true,
  };
}

/** Coerce one raw JSON entry into a well-formed slide (or null if unusable). */
export function normalizeSlide(raw: unknown): HeroSlide | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const title_fr = clamp(s.title_fr, MAX_LEN.title);
  const title_ar = clamp(s.title_ar, MAX_LEN.title);
  const image = clamp(s.image, MAX_LEN.href);
  // A slide with neither image nor title renders as an empty band — drop it.
  if (!image && !title_fr && !title_ar) return null;
  return {
    id: clamp(s.id, 40) || newSlideId(),
    image,
    title_fr,
    title_ar,
    text_fr: clamp(s.text_fr, MAX_LEN.text),
    text_ar: clamp(s.text_ar, MAX_LEN.text),
    btn_label_fr: clamp(s.btn_label_fr, MAX_LEN.label),
    btn_label_ar: clamp(s.btn_label_ar, MAX_LEN.label),
    btn_href: href(s.btn_href),
    btn2_label_fr: clamp(s.btn2_label_fr, MAX_LEN.label),
    btn2_label_ar: clamp(s.btn2_label_ar, MAX_LEN.label),
    btn2_href: href(s.btn2_href),
    title_color: hex(s.title_color),
    text_color: hex(s.text_color),
    // Missing field (old JSON) → 100 keeps the previous look.
    overlay: s.overlay === undefined ? 100 : pct(s.overlay, 100),
    active: bool(s.active),
  };
}

/** Parse the settings value into a safe, capped slide list. */
export function parseSlides(raw: string | undefined | null): HeroSlide[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const slides: HeroSlide[] = [];
    for (const entry of data) {
      if (slides.length >= MAX_SLIDES) break;
      const slide = normalizeSlide(entry);
      if (slide) slides.push(slide);
    }
    return slides;
  } catch {
    return [];
  }
}

/** Public view: only active slides. */
export function activeSlides(slides: HeroSlide[]): HeroSlide[] {
  return slides.filter((s) => s.active);
}
