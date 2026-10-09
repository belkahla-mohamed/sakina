"use client";

import Link from "next/link";
import { useFavs, useLang } from "@/components/providers";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export function FavoritesView({ products }: { products: Product[] }) {
  const { t } = useLang();
  const { slugs } = useFavs();

  const items = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 lg:px-6 py-16 text-center">
        <div className="card p-10 anim-fade-up">
          <p className="font-display text-[24px] font-bold">{t("fav.empty")}</p>
          <Link href="/shop" className="btn btn-primary mt-5 inline-flex">
            {t("cart.back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-6 py-8 md:py-12 anim-fade-up">
      <h1 className="text-[30px] md:text-[38px] font-bold">{t("fav.title")}</h1>
      <p className="text-ink-soft mt-1">
        {items.length} {t("shop.results")}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {items.map((product, i) => (
          <ProductCard key={product.slug} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
