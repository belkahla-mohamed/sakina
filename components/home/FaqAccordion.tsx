"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";
import { FAQ_ITEMS } from "@/lib/faq";

export function FaqAccordion({
  withHeader = true,
  heading = "h2",
}: {
  withHeader?: boolean;
  heading?: "h1" | "h2";
}) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState<string | null>(FAQ_ITEMS[0].id);
  const Heading = heading;

  return (
    <section className="mx-auto max-w-3xl px-4 lg:px-6 py-12 md:py-16 anim-reveal">
      {withHeader && (
        <div className="text-center mb-7">
          <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-primary">
            {t("home.faqSub")}
          </p>
          <Heading className="text-[28px] md:text-[34px] font-bold mt-2">{t("home.faqTitle")}</Heading>
        </div>
      )}

      <div className="card px-5 md:px-7">
        {FAQ_ITEMS.map((item) => {
          const isOpen = open === item.id;
          return (
            <div key={item.id} className="border-b-2 border-line last:border-b-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="group w-full flex justify-between items-center gap-4 py-4 text-start"
                aria-expanded={isOpen}
              >
                <span>
                  <span className="block font-display font-bold text-[16.5px] leading-tight">
                    {lang === "ar" ? item.q_ar : item.q_fr}
                  </span>
                </span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-110 active:scale-90 ${
                    isOpen ? "bg-primary text-white border-ink" : "border-line text-ink"
                  }`}
                >
                  {isOpen ? <Minus size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
                </span>
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className={`pb-4 -mt-1 text-[14.5px] text-ink-soft leading-relaxed transition-opacity duration-200 ${
                      isOpen ? "opacity-100" : "opacity-0"
                    } ${lang === "ar" ? "ar" : ""}`}
                  >
                    {lang === "ar" ? item.a_ar : item.a_fr}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-7">
        <p className="text-[14px] text-ink-soft">{t("home.faqNoAnswer")}</p>
        <Link href="/contact" className="inline-block font-display font-bold mt-1.5 text-primary underline underline-offset-4">
          {t("wa.cta")} <span className="arrow-end" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
