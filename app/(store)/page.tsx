import { getCategories, getProducts } from "@/lib/catalog";
import { getHeroSlides, getProductRotation } from "@/lib/site";
import { Hero } from "@/components/home/Hero";
import { HeroSlider } from "@/components/home/HeroSlider";
import { TrustStrip } from "@/components/home/TrustStrip";
import { PromoPack } from "@/components/home/PromoPack";
import { CategoryBento } from "@/components/home/CategoryBento";
import { ProductGrid } from "@/components/home/ProductGrid";
import { Testimonials } from "@/components/home/Testimonials";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { CtaSteps } from "@/components/home/CtaSteps";

export default async function HomePage() {
  const [products, categories, slides, rotate] = await Promise.all([
    getProducts(),
    getCategories(),
    getHeroSlides(),
    getProductRotation(),
  ]);

  const counts: Record<string, number> = {};
  for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;

  const bestsellers = products
    .filter((p) => p.is_bestseller)
    .concat(products.filter((p) => !p.is_bestseller))
    .slice(0, 8);
  const news = products.filter((p) => p.is_new).slice(0, 4);
  const promo = products.find((p) => p.slug === "plaid-chenille-150x200") ?? products[0];

  return (
    <>
      {slides.length > 0 && <HeroSlider slides={slides} />}
      <Hero />
      <ProductGrid titleKey="home.newTitle" products={news} href="/shop?sort=new" autoRotate={rotate} />
      <ProductGrid titleKey="home.bestTitle" products={bestsellers} href="/shop?sort=best" autoRotate={rotate} />
      <PromoPack product={promo} />
      <CategoryBento categories={categories} counts={counts} />
      <TrustStrip />
      <Testimonials />
      <FaqAccordion />
      <CtaSteps />
    </>
  );
}
