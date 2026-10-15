"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";
import type { HeroSlide } from "@/lib/types";

const AUTOPLAY_MS = 6000;

/**
 * Text + buttons of one slide. Shared between the live homepage slider and the
 * admin preview so what you edit is exactly what ships.
 */
export function SlideContent({
  slide,
  lang,
  compact = false,
}: {
  slide: HeroSlide;
  lang: "fr" | "ar";
  compact?: boolean;
}) {
  const title = lang === "ar" ? slide.title_ar || slide.title_fr : slide.title_fr || slide.title_ar;
  const text = lang === "ar" ? slide.text_ar || slide.text_fr : slide.text_fr || slide.text_ar;
  const btn1 = lang === "ar" ? slide.btn_label_ar || slide.btn_label_fr : slide.btn_label_fr || slide.btn_label_ar;
  const btn2 = lang === "ar" ? slide.btn2_label_ar || slide.btn2_label_fr : slide.btn2_label_fr || slide.btn2_label_ar;

  if (!title && !text && !btn1 && !btn2) return null;

  const ar = lang === "ar" ? "ar" : "";

  return (
    <div className={`space-y-3 ${compact ? "text-[13px]" : ""}`}>
      {title && (
        <h2
          className={`font-display font-bold text-white leading-tight ${ar} ${
            compact ? "text-[18px]" : "text-[28px] md:text-[40px]"
          }`}
        >
          {title}
        </h2>
      )}
      {text && (
        <p
          className={`text-white/85 max-w-lg ${ar} ${compact ? "text-[12.5px]" : "text-[15px] md:text-[17px]"}`}
        >
          {text}
        </p>
      )}
      {(btn1 || btn2) && (
        <div className={`flex flex-wrap gap-3 ${compact ? "pt-1" : "pt-2"}`}>
          {btn1 && slide.btn_href && (
            <Link
              href={slide.btn_href}
              className={`btn bg-white text-ink hover:bg-cream ${compact ? "!px-4 !py-2.5 !text-[10px]" : ""}`}
            >
              {btn1}
              <ArrowRight size={13} weight="bold" className="rtl:rotate-180" />
            </Link>
          )}
          {btn2 && slide.btn2_href && (
            <Link
              href={slide.btn2_href}
              className={`btn border-white text-white hover:bg-white hover:text-ink ${compact ? "!px-4 !py-2.5 !text-[10px]" : ""}`}
            >
              {btn2}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Homepage hero slider. Renders nothing when there are no active slides.
 * Auto-advances, pauses on hover/focus, and respects prefers-reduced-motion.
 */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const { lang } = useLang();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  const count = slides.length;
  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (count <= 1 || paused || reducedMotion.current) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused, index]);

  if (count === 0) return null;
  const slide = slides[Math.min(index, count - 1)];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Sakina Stores"
      className="border-b border-line relative overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[320px] md:h-[420px]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={i !== index}
          >
            {s.image && (
              <Image
                src={s.image}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/20" />
            <div
              className={`relative h-full mx-auto max-w-6xl px-4 lg:px-6 flex items-end pb-10 md:pb-14 ${
                lang === "ar" ? "text-right" : ""
              }`}
            >
              <div className="max-w-xl">
                <SlideContent slide={s} lang={lang} />
              </div>
            </div>
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={lang === "ar" ? "الشريحة السابقة" : "Slide précédent"}
              className="absolute bottom-2.5 start-2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:start-4 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white flex items-center justify-center hover:bg-white/35 transition-colors"
            >
              <CaretLeft size={17} weight="bold" className="rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={lang === "ar" ? "الشريحة التالية" : "Slide suivant"}
              className="absolute bottom-2.5 end-2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:end-4 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 text-white flex items-center justify-center hover:bg-white/35 transition-colors"
            >
              <CaretRight size={17} weight="bold" className="rtl:rotate-180" />
            </button>

            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${lang === "ar" ? "الشريحة" : "Slide"} ${i + 1}`}
                  aria-current={i === index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/45 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
