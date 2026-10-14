"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Check } from "@phosphor-icons/react";
import { useCart, useFavs, useLang } from "@/components/providers";
import { formatPrice } from "@/lib/i18n";
import { PRODUCT_BGS } from "@/lib/product-bgs";
import type { Product } from "@/lib/types";

const BADGE_STYLE: Record<string, string> = {
  promo: "bg-primary text-white",
  nouveau: "bg-highlight text-cream",
  epuise: "bg-ink text-white",
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const { has, toggle } = useFavs();
  const [added, setAdded] = useState(false);
  const liked = has(product.slug);

  const soldOut = product.badge === "epuise" || product.stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    add(product.slug, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div
      className="card h-full overflow-hidden flex flex-col relative group hover:-translate-y-1 anim-fade-up"
      style={{
        backgroundColor: PRODUCT_BGS[product.slug],
        animationDelay: `${Math.min(index, 7) * 60}ms`,
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 block">
          <Image
            src={product.image}
            alt={lang === "ar" ? product.name_ar : product.name_fr}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {product.badge && (
          <span
            className={`absolute top-2 start-2 rounded-md border border-ink/20 px-1.5 py-[3px] text-[9.5px] font-bold uppercase tracking-[0.08em] anim-pop ${BADGE_STYLE[product.badge]}`}
          >
            {product.badge === "promo"
              ? t("product.promo")
              : product.badge === "nouveau"
                ? t("product.new")
                : t("product.soldout")}
          </span>
        )}

        <button
          type="button"
          aria-label={liked ? t("a11y.favRemove") : t("a11y.fav")}
          aria-pressed={liked}
          onClick={() => toggle(product.slug)}
          className="absolute top-2 end-2 w-9 h-9 rounded-full bg-white/95 border border-line flex items-center justify-center hover:border-ink"
        >
          <Heart
            size={16}
            weight="bold"
            className={`${liked ? "text-primary anim-pop" : "text-ink-soft"}`}
          />
        </button>
      </div>

      <div className="p-3.5 flex flex-col flex-1">
        <Link href={`/product/${product.slug}`} className="leading-tight">
          <p className="font-display font-bold text-[15px] line-clamp-2 min-h-[2.5em]">
            {lang === "ar" ? product.name_ar : product.name_fr}
          </p>
        </Link>

        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-ink-soft">
          <Star size={13} weight="fill" className="text-highlight" />
          <span className="font-bold text-ink">{product.rating.toFixed(1)}</span>
          <span>({product.reviews} {t("product.reviews")})</span>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mt-2">
          <span className="price text-[18px]">{formatPrice(product.price, lang)}</span>
          {product.old_price && (
            <span className="text-[13px] line-through text-ink-soft whitespace-nowrap">
              {formatPrice(product.old_price, lang)}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut}
            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-[10px] py-2.5 font-display font-bold text-[13.5px] transition-colors ${
              soldOut
                ? "border border-line text-ink-soft"
                : added
                  ? "bg-ink text-white"
                  : "bg-primary text-white hover:bg-ink"
            }`}
          >
            {soldOut ? (
              t("product.out")
            ) : (
              <span className={`inline-flex items-center gap-1.5 ${added ? "anim-pop" : ""}`}>
                {added ? (
                  <>
                    <Check size={15} weight="bold" /> {t("product.added")}
                  </>
                ) : (
                  t("product.add_short")
                )}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
