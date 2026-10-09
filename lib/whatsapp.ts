import { SITE } from "@/lib/config";
import { formatPrice } from "@/lib/i18n";
import type { CartEntry } from "@/components/providers";
import type { Product } from "@/lib/types";

export const FREE_SHIPPING_FROM = SITE.freeShippingFrom;
export const SHIPPING_COST = 30;

export interface Line {
  product: Product;
  qty: number;
}

export interface Totals {
  subtotal: number;
  shipping: number;
  total: number;
}

export function buildLines(entries: CartEntry[], products: Product[]): Line[] {
  const lines: Line[] = [];
  for (const entry of entries) {
    const product = products.find((p) => p.slug === entry.slug);
    if (product) lines.push({ product, qty: entry.qty });
  }
  return lines;
}

export function computeTotals(lines: Line[]): Totals {
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  return { subtotal, shipping, total: subtotal + shipping };
}

export interface Customer {
  name: string;
  phone: string;
  city: string;
  address: string;
}

export function buildOrderMessage(lines: Line[], totals: Totals, customer: Customer): string {
  const frLines = lines
    .map((l) => `- ${l.qty}x ${l.product.name_fr} — ${formatPrice(l.product.price * l.qty, "fr")}`)
    .join("\n");
  const arLines = lines
    .map((l) => `- ${l.qty}x ${l.product.name_ar} — ${formatPrice(l.product.price * l.qty, "ar")}`)
    .join("\n");

  const shippingLabel = (lang: "fr" | "ar") =>
    totals.shipping === 0
      ? lang === "fr"
        ? "Gratuite"
        : "مجاني"
      : formatPrice(totals.shipping, lang);

  const ar = [
    "طلب جديد من ساكينا:",
    "",
    arLines,
    "",
    `المجموع الفرعي: ${formatPrice(totals.subtotal, "ar")}`,
    `التوصيل: ${shippingLabel("ar")}`,
    `المجموع: ${formatPrice(totals.total, "ar")}`,
    "",
    `الاسم: ${customer.name}`,
    `الهاتف: ${customer.phone}`,
    `المدينة: ${customer.city}`,
    `العنوان: ${customer.address}`,
    "",
    "──────────",
    "",
    "Nouvelle commande Sakina :",
    "",
    frLines,
    "",
    `Sous-total : ${formatPrice(totals.subtotal, "fr")}`,
    `Livraison : ${shippingLabel("fr")}`,
    `Total : ${formatPrice(totals.total, "fr")}`,
    "",
    `Nom : ${customer.name}`,
    `Tél : ${customer.phone}`,
    `Ville : ${customer.city}`,
    `Adresse : ${customer.address}`,
  ];

  return ar.join("\n");
}

export function whatsappLink(message?: string, number: string = SITE.whatsapp): string {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export interface ReviewInput {
  name: string;
  city: string;
  rating: number;
  text: string;
}

export function buildReviewMessage(r: ReviewInput): string {
  const stars = "⭐".repeat(r.rating);
  const cityLine = r.city.trim() ? `\nVille : ${r.city.trim()}` : "";
  const cityLineAr = r.city.trim() ? `\nالمدينة : ${r.city.trim()}` : "";

  return [
    `Avis client Sakina ${stars}`,
    `Nom : ${r.name.trim()}`,
    `Note : ${r.rating}/5${cityLine}`,
    `Avis : « ${r.text.trim()} »`,
    "",
    "──────────",
    "",
    `تقييم جديد من ساكينا ${stars}`,
    `الاسم : ${r.name.trim()}`,
    `التقييم : ${r.rating}/5${cityLineAr}`,
    `النص : « ${r.text.trim()} »`,
  ].join("\n");
}
