import type { Category, Product } from "@/lib/types";

/**
 * Normalize text for fuzzy-ish matching:
 * lowercase, strip latin + arabic diacritics, unify alef/ya/ta marbuta.
 */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u064B-\u0652]/g, "")
    .replace(/[\u0623\u0625\u0622]/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u0629/g, "\u0647")
    .trim();
}

/** Same semantics as the shop page: name + description, both languages. */
export function matchesProduct(product: Product, query: string): boolean {
  const q = normalizeText(query);
  if (!q) return true;
  return (
    normalizeText(product.name_fr).includes(q) ||
    normalizeText(product.name_ar).includes(q) ||
    normalizeText(product.desc_fr).includes(q) ||
    normalizeText(product.desc_ar).includes(q)
  );
}

/**
 * Ranked instant search: name prefix > name > category > description.
 * Results keep catalog order (bestsellers first) inside each rank.
 */
export function searchProducts(
  products: Product[],
  categories: Category[],
  query: string,
  limit = 6
): Product[] {
  const q = normalizeText(query);
  if (!q) return [];

  const matchedCats = new Set(
    categories
      .filter(
        (c) => normalizeText(c.name_fr).includes(q) || normalizeText(c.name_ar).includes(q)
      )
      .map((c) => c.slug)
  );

  const scored: { product: Product; score: number }[] = [];
  for (const product of products) {
    const nameFr = normalizeText(product.name_fr);
    const nameAr = normalizeText(product.name_ar);
    let score = 0;
    if (nameFr.startsWith(q) || nameAr.startsWith(q)) score = 4;
    else if (nameFr.includes(q) || nameAr.includes(q)) score = 3;
    else if (matchedCats.has(product.category)) score = 2;
    else if (
      normalizeText(product.desc_fr).includes(q) ||
      normalizeText(product.desc_ar).includes(q)
    )
      score = 1;
    if (score > 0) scored.push({ product, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.product);
}

export function countMatches(
  products: Product[],
  categories: Category[],
  query: string
): number {
  return searchProducts(products, categories, query, products.length).length;
}
