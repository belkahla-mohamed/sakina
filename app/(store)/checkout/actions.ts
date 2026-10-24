"use server";

import { dbCreateOrder, type CreateOrderInput } from "@/lib/db/orders";
import { dbProductsBySlugs } from "@/lib/db/store";
import { getPublicSettings } from "@/lib/site";
import { deliveryCostFor } from "@/lib/whatsapp";

const MAX_QTY = 50;

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export interface PlaceOrderInput {
  customer: { name?: string; phone?: string; city?: string; address?: string };
  items: { slug?: string; qty?: number }[];
}

export interface PlaceOrderResult {
  ok: boolean;
  reference?: string;
  error?: string;
}

/**
 * Records a checkout order. Prices, shipping and totals are recomputed from
 * the database — the client only supplies slugs and quantities, so a tampered
 * payload can never change what is charged.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const name = clean(input?.customer?.name, 120);
  const phone = clean(input?.customer?.phone, 40);
  const city = clean(input?.customer?.city, 80);
  const address = clean(input?.customer?.address, 300);

  if (!name || !phone || !city || !address) {
    return { ok: false, error: "Veuillez remplir tous les champs." };
  }

  const wanted = new Map<string, number>();
  const rawItems = Array.isArray(input?.items) ? input.items : [];
  for (const it of rawItems) {
    const slug = clean(it?.slug, 120);
    const qty = Math.floor(Number(it?.qty));
    if (!slug || !Number.isFinite(qty) || qty < 1) continue;
    wanted.set(slug, Math.min(qty, MAX_QTY));
  }
  if (wanted.size === 0) return { ok: false, error: "Votre panier est vide." };

  let products;
  try {
    products = await dbProductsBySlugs([...wanted.keys()]);
  } catch (e) {
    console.error("[placeOrder] products lookup failed:", e);
    return { ok: false, error: "Service momentanément indisponible. Réessayez dans un instant." };
  }
  const items: CreateOrderInput["items"] = [];
  let subtotal = 0;
  for (const p of products) {
    const qty = wanted.get(p.slug);
    if (!qty) continue;
    const price = Number(p.price);
    items.push({ slug: p.slug, name_fr: p.name_fr, name_ar: p.name_ar, price, qty });
    subtotal += price * qty;
  }
  if (items.length === 0) return { ok: false, error: "Aucun produit valide dans le panier." };

  const settings = await getPublicSettings();
  const shipping =
    subtotal === 0 || subtotal >= settings.freeShippingFrom
      ? 0
      : deliveryCostFor(city, settings.deliveryCasablanca, settings.deliveryOutside);
  const total = subtotal + shipping;

  try {
    const reference = await dbCreateOrder({
      customer: { name, phone, city, address },
      items,
      subtotal,
      shipping,
      total,
    });
    return { ok: true, reference };
  } catch (e) {
    console.error("[placeOrder] order insert failed:", e);
    return { ok: false, error: "Échec de l'enregistrement de la commande. Réessayez dans un instant." };
  }
}
