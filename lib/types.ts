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
  btn_label_fr: string;
  btn_label_ar: string;
  btn_href: string;
  btn2_label_fr: string;
  btn2_label_ar: string;
  btn2_href: string;
  active: boolean;
}

export type Lang = "fr" | "ar";
