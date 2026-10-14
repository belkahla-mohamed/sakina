"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";
import type { Category, Product } from "@/lib/types";

export function Hero({ categories, samples }: { categories: Category[]; samples: Product[] }) {
  const { lang, t } = useLang();
  const collage = samples.slice(0, 4);

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-14 md:py-20 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="anim-fade-up">
          <p className="eyebrow">{t("home.heroBadge")}</p>
          <h1 className="mt-6 text-[36px] md:text-[52px] leading-[1.12] heading-caps">
            {t("home.heroTitle1")} <span className="text-brick">{t("home.heroTitle2")}</span>
          </h1>
          <div className="rule w-16 my-7" />
          <p className={`text-[16px] md:text-[17px] text-ink-soft max-w-md ${lang === "ar" ? "ar" : ""}`}>
            {t("home.heroText")}
          </p>

          <div className="flex flex-wrap gap-3 mt-9">
            <Link href="/shop" className="btn btn-primary">
              {t("home.heroCta")}
            </Link>
            <Link href="/shop?sort=new" className="btn btn-outline">
              {t("home.heroCta2")}
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-9">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?cat=${c.slug}`}
                className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink-soft hover:text-brick transition-colors"
              >
                {lang === "ar" ? c.name_ar : c.name_fr}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {collage.map((p, i) => (
              <Link
                key={p.slug}
                href={`/product/${p.slug}`}
                className={`group relative aspect-[4/3] overflow-hidden bg-sand anim-fade-in ${i === 0 ? "md:-translate-y-3" : ""}`}
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                <Image
                  src={p.image}
                  alt={lang === "ar" ? p.name_ar : p.name_fr}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  // First card sits above the fold: preload it to kill CLS.
                  // The rest stay lazy (next/image default).
                  priority={i === 0}
                />
              </Link>
            ))}
          </div>
          <div
            className="absolute -bottom-5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 bg-cream border border-line rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] flex items-center gap-2 anim-fade-in"
            style={{ animationDelay: "600ms" }}
          >
            <span className="text-brick">★</span> 5,00 · 320+
            <ArrowRight size={14} weight="bold" className="text-brick rtl:scale-x-[-1]" />
          </div>
        </div>
      </div>
    </section>
  );
}
