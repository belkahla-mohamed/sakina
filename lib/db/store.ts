import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getPool, q, q1 } from "./pool";
import type { Product, Category } from "@/lib/types";

/* ---------------- Categories ---------------- */

export async function dbCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories");
  return q<Category>(
    "select * from public.categories order by featured desc, name_fr asc"
  );
}

/* ---------------- Products ---------------- */

const PRODUCT_ORDER = "is_bestseller desc, created_at desc, name_fr asc";

export async function dbProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  return q<Product>(`select * from public.products order by ${PRODUCT_ORDER}`);
}

export async function dbProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  return q1<Product>("select * from public.products where slug = $1", [slug]);
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
  return q1<Category>("select * from public.categories where slug = $1", [slug]);
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
  await q("delete from public.categories where slug = $1", [slug]);
}
