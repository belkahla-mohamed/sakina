"use client";

import Link from "next/link";
import { useLang } from "@/components/providers";
import { ProductCard } from "@/components/ProductCard";
import type { TKey } from "@/lib/i18n";
import type { Product } from "@/lib/types";

export function ProductGrid({
  titleKey,
  products,
  href,
  autoRotate = true,
}: {
  titleKey: TKey;
  products: Product[];
  href: string;
  autoRotate?: boolean;
}) {
  const { t } = useLang();

  // Nothing to show → the whole section disappears from the homepage.
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 lg:px-6 py-8 md:py-10 anim-reveal">
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-[28px] md:text-[32px] font-bold">{t(titleKey)}</h2>
        <Link href={href} className="inline-block py-1.5 text-[13.5px] font-bold text-primary underline underline-offset-4">
          {t("home.seeAll")}
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <ProductCard key={p.slug} product={p} index={i} autoRotate={autoRotate} />
        ))}
      </div>
    </section>
  );
}
