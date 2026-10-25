import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { dbAdminProducts, dbAdminCategories } from "@/lib/db/store";
import local from "@/data/catalog.json";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/offres`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE.url}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/favorites`, lastModified: now, changeFrequency: "weekly", priority: 0.4 },
    { url: `${SITE.url}/cart`, lastModified: now, changeFrequency: "weekly", priority: 0.4 },
    { url: `${SITE.url}/checkout`, lastModified: now, changeFrequency: "weekly", priority: 0.4 },
  ];

  // Route handlers / sitemaps prerender outside React's Suspense tree.
  // Using uncached dbAdmin* reads avoids Next.js 16 HANGING_PROMISE_REJECTION
  // while ensuring real DB products are indexed into sitemap.xml.
  let products: { slug: string; image?: string | null }[] = [];
  let categories: { slug: string }[] = [];

  if (process.env.DATABASE_URL) {
    try {
      const [pRows, cRows] = await Promise.all([
        dbAdminProducts(),
        dbAdminCategories(),
      ]);
      products = pRows;
      categories = cRows;
    } catch (e) {
      console.warn("[sitemap] DB fetch failed, using fallback:", e);
    }
  }

  if (products.length === 0) {
    products = (local.products as { slug: string; image?: string }[]).map((p) => ({
      slug: p.slug,
      image: p.image || `/img/products/${p.slug}.svg`,
    }));
  }

  for (const c of categories) {
    staticRoutes.push({
      url: `${SITE.url}/shop?cat=${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const p of products) {
    staticRoutes.push({
      url: `${SITE.url}/product/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      images: p.image?.startsWith("http") ? [p.image] : undefined,
    });
  }
  return staticRoutes;
}
