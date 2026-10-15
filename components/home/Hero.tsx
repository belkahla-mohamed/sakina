"use client";

import Link from "next/link";
import { BookOpen, Gift } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";

export function Hero() {
  const { lang, t } = useLang();

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-3xl px-4 lg:px-6 py-14 md:py-20 text-center">
        <div className="anim-fade-up">
          <p className="eyebrow">{t("home.heroBadge")}</p>
          <h1 className="mt-6 text-[36px] md:text-[52px] leading-[1.12] heading-caps">
            {t("home.heroTitle1")} <span className="text-brick">{t("home.heroTitle2")}</span>
          </h1>
          <div className="rule w-16 mx-auto my-7" />
          <div className={`mt-5 space-y-2 text-[16px] md:text-[17px] text-ink-soft max-w-xl mx-auto ${lang === "ar" ? "ar" : ""}`}>
            <p className="flex items-start gap-2.5 text-start">
              <BookOpen size={20} weight="bold" className="text-brick shrink-0 mt-0.5" aria-hidden />
              <span>{t("home.heroText1")}</span>
            </p>
            <p className="flex items-start gap-2.5 text-start">
              <Gift size={20} weight="bold" className="text-brick shrink-0 mt-0.5" aria-hidden />
              <span>{t("home.heroText2")}</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-9">
            <Link href="/shop" className="btn btn-primary">
              {t("home.heroCta")}
            </Link>
            <Link href="/shop?sort=new" className="btn btn-outline">
              {t("home.heroCta2")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
