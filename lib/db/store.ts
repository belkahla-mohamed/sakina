import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getPool, q, q1, withTx } from "./pool";
import type { Product, Category } from "@/lib/types";

/* ---------------- Categories ---------------- */

export async function dbCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories");
  try {
    return await q<Category>(
      "select * from public.categories order by featured desc, name_fr asc"
    );
  } catch (e) {
    console.warn("[catalog] dbCategories failed:", e);
    return [];
  }
}

/* ---------------- Products ---------------- */

const PRODUCT_ORDER = "is_bestseller desc, created_at desc, name_fr asc";

export async function dbProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  try {
    return await q<Product>(`select * from public.products order by ${PRODUCT_ORDER}`);
  } catch (e) {
    console.warn("[catalog] dbProducts failed:", e);
    return [];
  }
}

export async function dbProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  try {
    return await q1<Product>("select * from public.products where slug = $1", [slug]);
  } catch (e) {
    console.warn("[catalog] dbProduct failed:", e);
    return null;
  }
}

/* ---------------- Admin reads (uncached, always fresh) ---------------- */

export async function dbAdminProducts(): Promise<Product[]> {
  return q<Product>(`select * from public.products order by ${PRODUCT_ORDER}`);
}

export async function dbAdminProduct(slug: string): Promise<Product | null> {
  return q1<Product>("select * from public.products where slug = $1", [slug]);
}

/** Uncached lookup for checkout price verification (never trust client prices). */
export async function dbProductsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  return q<Product>("select * from public.products where slug = any($1::text[])", [slugs]);
}

export async function dbAdminCategories(): Promise<Category[]> {
  return q<Category>("select * from public.categories order by name_fr asc");
}

export async function dbAdminCategory(slug: string): Promise<Category | null> {
  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    /* ignore malformed URI */
  }
  const slugified = decoded
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return q1<Category>(
    `select * from public.categories 
      where slug = $1 
         or slug = $2 
         or slug = $3 
         or lower(slug) = lower($1) 
         or lower(slug) = lower($2)
         or lower(slug) = lower($3)
      limit 1`,
    [slug, decoded, slugified]
  );
}

export interface ProductInput {
  slug: string;
  name_fr: string;
  name_ar: string;
  category: string;
  price: number;
  old_price: number | null;
  badge: string | null;
  rating: number;
  reviews: number;
  stock: number;
  is_new: boolean;
  is_bestseller: boolean;
  desc_fr: string;
  desc_ar: string;
  image: string | null;
  images: string[];
}

const PRODUCT_COLS = [
  "slug",
  "name_fr",
  "name_ar",
  "category",
  "price",
  "old_price",
  "badge",
  "rating",
  "reviews",
  "stock",
  "is_new",
  "is_bestseller",
  "desc_fr",
  "desc_ar",
  "image",
  "images",
] as const;

function productValues(p: ProductInput): unknown[] {
  return PRODUCT_COLS.map((c) => p[c]);
}

export async function dbInsertProduct(p: ProductInput): Promise<void> {
  const placeholders = PRODUCT_COLS.map((_, i) => `$${i + 1}`).join(", ");
  await q(
    `insert into public.products (${PRODUCT_COLS.join(", ")}) values (${placeholders})`,
    productValues(p)
  );
}

/**
 * Update one product by slug.
 *
 * Returns whether a row was actually matched. The edit form carries the slug
 * in a `disabled` input — which browsers omit from `FormData` — so a
 * regenerated slug can silently target a non-existent row. Callers must treat
 * `false` as a failure instead of reporting success.
 */
export async function dbUpdateProduct(
  slug: string,
  p: ProductInput
): Promise<boolean> {
  const sets = PRODUCT_COLS.map((c, i) => `${c} = $${i + 2}`).join(", ");
  const res = await getPool().query(
    `update public.products set ${sets} where slug = $1`,
    [slug, ...productValues(p)]
  );
  return (res.rowCount ?? 0) > 0;
}

export async function dbDeleteProduct(slug: string): Promise<void> {
  await q("delete from public.products where slug = $1", [slug]);
}

export async function dbDeleteProducts(slugs: string[]): Promise<number> {
  if (slugs.length === 0) return 0;
  const rows = await q<{ one: number }>(
    "delete from public.products where slug = any($1::text[]) returning 1",
    [slugs]
  );
  return rows.length;
}

/* ---------------- Category mutations ---------------- */

export interface CategoryInput {
  slug: string;
  name_fr: string;
  name_ar: string;
  tagline_fr: string;
  tagline_ar: string;
    color: string;
    text: string;
    icon: string;
    image: string | null;
    featured: boolean;
  }

const CATEGORY_COLS = [
  "slug",
  "name_fr",
  "name_ar",
  "tagline_fr",
  "tagline_ar",
    "color",
    "text",
    "icon",
    "image",
    "featured",
  ] as const;

export async function dbUpsertCategory(c: CategoryInput): Promise<void> {
  const placeholders = CATEGORY_COLS.map((_, i) => `$${i + 1}`).join(", ");
  const sets = CATEGORY_COLS.map((c2) => `${c2} = excluded.${c2}`).join(", ");
  await q(
    `insert into public.categories (${CATEGORY_COLS.join(", ")}) values (${placeholders})
     on conflict (slug) do update set ${sets}`,
    CATEGORY_COLS.map((c2) => c[c2])
  );
}

export async function dbDeleteCategory(slug: string): Promise<void> {
  await withTx(async (c) => {
    await c.query("delete from public.products where category = $1", [slug]);
    await c.query("delete from public.categories where slug = $1", [slug]);
  });
}

export async function dbDeleteCategories(slugs: string[]): Promise<number> {
  if (slugs.length === 0) return 0;
  return withTx(async (c) => {
    await c.query("delete from public.products where category = any($1::text[])", [slugs]);
    const res = await c.query(
      "delete from public.categories where slug = any($1::text[]) returning 1",
      [slugs]
    );
    return res.rowCount ?? 0;
  });
}
