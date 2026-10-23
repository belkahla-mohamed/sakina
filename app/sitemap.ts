import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { getCategories, getProducts } from "@/lib/catalog";

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

  // Catalog reads never throw (local JSON fallback), so the sitemap always
  // includes products even if the database is unreachable at build time.
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

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
