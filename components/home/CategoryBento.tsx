"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Backpack,
  BookOpen,
  Gift,
  PuzzlePiece,
  TShirt,
} from "@phosphor-icons/react";
import { useLang } from "@/components/providers";
import type { Category } from "@/lib/types";

const ICONS: Record<string, typeof Gift> = {
  puzzle: PuzzlePiece,
  book: BookOpen,
  backpack: Backpack,
  gift: Gift,
  tshirt: TShirt,
};

export function CategoryBento({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const { lang, t } = useLang();
  const featured = categories.find((c) => c.featured) ?? categories[0];
  const rest = categories.filter((c) => c.slug !== featured?.slug);

  const textColor = (c: Category) => (c.text === "dark" ? "text-ink" : "text-white");

  return (
    <section className="mx-auto max-w-6xl px-4 lg:px-6 py-10 md:py-14 anim-reveal">
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-[28px] md:text-[32px] font-bold">{t("home.catTitle")}</h2>
        <Link href="/shop" className="inline-block py-1.5 text-[13.5px] font-bold text-primary underline underline-offset-4">
          {t("home.catSeeAll")}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ gridAutoRows: "1fr" }}>
        <Link
          href={`/shop?cat=${featured.slug}`}
          className="card col-span-2 row-span-2 flex flex-col justify-between p-6 md:p-7 relative overflow-hidden"
          style={{ background: "linear-gradient(140deg,#FFE3EE,#FFF3CF)" }}
        >
          <div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-white text-primary">
              {t("home.catMostVisited")}
            </span>
            <p className="text-3xl md:text-5xl font-bold leading-[1.02] mt-4 font-display">
              {lang === "ar" ? featured.name_ar : featured.name_fr}
            </p>
            <p className={`text-[15px] mt-2 font-bold ${lang === "ar" ? "ar" : ""}`} style={{ color: "var(--color-ink-soft)" }}>
              {lang === "ar" ? featured.tagline_ar : featured.tagline_fr}
            </p>
          </div>
          <div className="flex items-center justify-between mt-6">
            <span className="text-[13px] font-extrabold">
              {counts[featured.slug] ?? 0} {t("home.productsCount")}
            </span>
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center text-white border-2 border-ink"
              style={{ background: featured.color }}
            >
              <ArrowRight size={20} weight="bold" className="rtl:rotate-180" />
            </span>
          </div>
        </Link>

        {rest.map((c) => {
          const Icon = ICONS[c.icon] ?? Gift;
          return (
            <Link
              key={c.slug}
              href={`/shop?cat=${c.slug}`}
              className={`card flex flex-col justify-between p-5 border-ink overflow-hidden ${textColor(c)}`}
              style={{ background: c.color }}
            >
              {c.image ? (
                <span className="relative block w-14 h-14 rounded-[14px] overflow-hidden border-2 border-ink/20 bg-white/60">
                  <Image
                    src={c.image}
                    alt={lang === "ar" ? c.name_ar : c.name_fr}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </span>
              ) : (
                <Icon size={30} />
              )}
              <div className="mt-4">
                <p className="font-display text-[16.5px] font-bold leading-tight">
                  {lang === "ar" ? c.name_ar : c.name_fr}
                </p>
                <p className={`text-[11.5px] mt-1 ${c.text === "dark" ? "text-ink-soft" : "opacity-85"}`}>
                  {counts[c.slug] ?? 0} {t("home.productsCount")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
