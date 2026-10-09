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
    <section
      className="border-b-2 border-line"
      style={{ background: "linear-gradient(120deg,#FFE3EE 0%,#FFF3CF 50%,#D6F5F2 100%)" }}
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center">
        <div className="anim-fade-up">
          <span className="inline-block bg-white border-2 border-ink rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider">
            {t("home.heroBadge")}
          </span>
          <h1 className="mt-4 text-[42px] md:text-[54px] font-extrabold leading-[1.03]">
            {t("home.heroTitle1")} <span className="text-primary">{t("home.heroTitle2")}</span>
          </h1>
          <p className={`mt-4 text-[16px] md:text-[17px] text-ink-soft max-w-lg ${lang === "ar" ? "ar" : ""}`}>
            {t("home.heroText")}
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/shop" className="btn btn-primary">
              {t("home.heroCta")}
            </Link>
            <Link href="/shop?sort=new" className="btn btn-outline">
              {t("home.heroCta2")}
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mt-7">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop?cat=${c.slug}`}
                className="rounded-full bg-white border-2 border-ink px-3.5 py-2 text-[13px] font-bold hover:bg-highlight transition-colors"
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
                className={`card overflow-hidden relative aspect-[4/3] ${i % 2 === 0 ? "-rotate-2" : "rotate-2"} hover:rotate-0 transition-transform anim-fade-in`}
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                <Image
                  src={p.image}
                   alt={lang === "ar" ? p.name_ar : p.name_fr}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </Link>
            ))}
          </div>
          <div
            className="absolute -bottom-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 bg-white border-2 border-ink rounded-full shadow-pop px-5 py-2.5 text-[13px] font-extrabold flex items-center gap-2 anim-fade-in"
            style={{ animationDelay: "600ms" }}
          >
            <span className="text-highlight">★</span> 5,00 · 320+
            <ArrowRight size={15} weight="bold" className="text-primary rtl:scale-x-[-1]" />
          </div>
        </div>
      </div>
    </section>
  );
}
