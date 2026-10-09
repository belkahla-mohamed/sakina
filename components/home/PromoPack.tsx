"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/components/providers";
import { formatPrice } from "@/lib/i18n";
import type { Product } from "@/lib/types";

export function PromoPack({ product }: { product?: Product }) {
  const { lang, t } = useLang();
  if (!product) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 lg:px-6 py-10 md:py-14 anim-reveal">
      <div className="card overflow-hidden grid md:grid-cols-2 items-stretch">
        <div className="relative min-h-[240px] bg-highlight/40">
          <Image
            src={product.image}
            alt={lang === "ar" ? product.name_ar : product.name_fr}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          <span className="absolute top-3 start-3 bg-primary text-white border-2 border-ink rounded-full px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.06em]">
            {t("home.promoBadge")}
          </span>
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-center">
          <h2 className="text-[26px] md:text-[30px] font-bold">{t("home.promoTitle")}</h2>
          <p className={`mt-3 text-ink-soft ${lang === "ar" ? "ar" : ""}`}>{t("home.promoText")}</p>

          <div className="flex items-baseline gap-3 mt-5">
            <span className="price text-[26px] text-primary">{formatPrice(product.price, lang)}</span>
            {product.old_price && (
              <span className="text-[16px] line-through text-ink-soft">
                {formatPrice(product.old_price, lang)}
              </span>
            )}
          </div>

          <div className="mt-5">
            <Link href={`/product/${product.slug}`} className="btn btn-highlight">
              {t("home.promoCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
