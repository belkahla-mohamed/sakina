import { cacheLife, cacheTag } from "next/cache";
import type { Badge, Category, Product } from "@/lib/types";
import { dbCategories, dbProducts } from "@/lib/db/store";
import local from "@/data/catalog.json";

type LocalProduct = Omit<Product, "badge" | "image"> & {
  badge?: string | null;
  image?: string | null;
};

const localProducts: Product[] = (local.products as unknown as LocalProduct[]).map((p) => ({
  ...p,
  badge: (p.badge as Badge) ?? null,
  image: p.image || `/img/products/${p.slug}.svg`,
  images: [p.image || `/img/products/${p.slug}.svg`],
}));

// The storefront must read the SAME Postgres the admin writes to
// (`DATABASE_URL` via lib/db/store). The seed JSON is only a dev
// fallback for PRODUCTS when no database is configured — never a
// substitute for a real (even empty) query result, otherwise deleted
// products resurrect from catalog.json.
// Categories, however, are DATABASE-ONLY: an empty or failing query
// yields [] and the home section simply hides — demo categories must
// never resurface on a real store.
// Products may legitimately have no image (DB row with null). Every render
// site assumes a string, so normalise once here instead of guarding each one.
const PLACEHOLDER = "/img/placeholder.svg";

/** Cover first, extras after, duplicates dropped. Always a non-empty list. */
function normalizeGallery(image: string | null, images?: string[] | null): string[] {
  const cover = image || PLACEHOLDER;
  const extras = (images ?? []).filter((u): u is string => Boolean(u) && u !== cover);
  return [cover, ...extras];
}

export async function getCategories(): Promise<Category[]> {
  if (!process.env.DATABASE_URL) return [];
  try {
    return await dbCategories();
  } catch (e) {
    console.warn("[catalog] categories query failed:", e);
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  if (!process.env.DATABASE_URL) return localProducts;
  try {
    const rows = await dbProducts();
    if (rows.length === 0) return localProducts;
    return rows.map((p) => {
      const gallery = normalizeGallery(p.image, p.images);
      return { ...p, image: gallery[0], images: gallery };
    });
  } catch (e) {
    console.warn("[catalog] products query failed, using local seed:", e);
    return localProducts;
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getNewProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.is_new).concat(products.filter((p) => !p.is_new)).slice(0, 8);
}

export async function getBestsellers(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.is_bestseller).concat(products.filter((p) => !p.is_bestseller)).slice(0, 8);
}
