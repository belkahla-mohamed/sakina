export type CategoryText = "light" | "dark";

export interface Category {
  slug: string;
  name_fr: string;
  name_ar: string;
  tagline_fr: string;
  tagline_ar: string;
  color: string;
  text: CategoryText;
  icon: string;
  image: string | null;
  featured: boolean;
}

export type Badge = "nouveau" | "promo" | "epuise";

export interface Product {
  slug: string;
  name_fr: string;
  name_ar: string;
  category: string;
  price: number;
  old_price: number | null;
  badge: Badge | null;
  rating: number;
  reviews: number;
  stock: number;
  is_new: boolean;
  is_bestseller: boolean;
  desc_fr: string;
  desc_ar: string;
  image: string;
  /** Ordered gallery (cover first). Older rows may not have it — fall back to `[image]`. */
  images?: string[];
}

export interface CartLine {
  slug: string;
  qty: number;
}

/** Homepage hero slider slide, stored as JSON in settings (`hero_slides`). */
export interface HeroSlide {
  id: string;
  image: string;
  title_fr: string;
  title_ar: string;
  text_fr: string;
  text_ar: string;
  /** Hex title color ("" = white). */
  title_color: string;
  /** Hex body-text color ("" = white). */
  text_color: string;
  /** Dark scrim over the image, 0–100 (100 = default gradient strength). */
  overlay: number;
  btn_label_fr: string;
  btn_label_ar: string;
  btn_href: string;
  btn2_label_fr: string;
  btn2_label_ar: string;
  btn2_href: string;
  active: boolean;
  /* ---- Per-element visibility (admin can hide any block; "" JSON = shown). ---- */
  show_title: boolean;
  show_text: boolean;
  show_btns: boolean;
  /* ---- Typography ("" / 0 = theme default). ---- */
  /** "display" (Prata) | "body" (Karla) | "" = default (display for title, body for text). */
  title_font: string;
  text_font: string;
  /** Override font size in px — 0 = theme default. */
  title_size: number;
  text_size: number;
  title_bold: boolean;
  title_underline: boolean;
  /* ---- Button colors ("" = theme default). ---- */
  btn1_bg: string;
  btn1_color: string;
  btn2_bg: string;
  btn2_color: string;
  /* ---- Scrim color ("" = ink gradient). ---- */
  overlay_color: string;
  /* ---- Content placement on the slide. ---- */
  align: "start" | "center" | "end";
  valign: "bottom" | "center";
}

/** Homepage promo offer, stored as JSON in settings (`offers`). */
export interface Offer {
  id: string;
  title_fr: string;
  title_ar: string;
  text_fr: string;
  text_ar: string;
  image: string;
  /** Discount kind and value. */
  discount_type: "percent" | "fixed";
  discount_value: number;
  btn_label_fr: string;
  btn_label_ar: string;
  btn_href: string;
  /* ---- Targeting: which products the offer is about (drives the CTA link). ---- */
  /** "all" = whole shop · "category" = every product of one category · "products" = hand-picked slugs. */
  target_type: "all" | "category" | "products";
  /** Category slug when target_type is "category" ("" = none picked yet). */
  target_category: string;
  /** Product slugs when target_type is "products". */
  target_products: string[];
  starts_at: string; // ISO date, "" = now
  ends_at: string;   // ISO date, "" = no expiry
  active: boolean;
  /** Admin picks whether this offer appears in the homepage section (/offres always lists active ones). */
  show_on_home: boolean;
  show_title: boolean;
  show_text: boolean;
  show_btns: boolean;
  title_font: string;
  text_font: string;
  title_size: number;
  text_size: number;
  title_bold: boolean;
  title_underline: boolean;
  title_color: string;
  text_color: string;
  btn1_bg: string;
  btn1_color: string;
  bg_color: string;        // card background hex ("" = default)
  bg_opacity: number;      // 0-100
  bg_shadow: string;       // shadow color hex ("" = none)
  bg_shadow_opacity: number;
  align: "start" | "center" | "end";
  valign: "bottom" | "center";
}

export type Lang = "fr" | "ar";
