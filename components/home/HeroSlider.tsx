"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";
import type { HeroSlide } from "@/lib/types";

const AUTOPLAY_MS = 6000;

/** Scale factor for the compact admin preview so custom px sizes stay proportional. */
const COMPACT_SCALE = 0.6;

/** Content-block placement classes shared by the homepage slider and the admin preview. */
export function slidePlacementClasses(slide: HeroSlide): string {
  return [
    slide.valign === "center" ? "items-center py-10 md:py-12" : "items-end pb-10 md:pb-14",
    slide.align === "center" ? "justify-center" : slide.align === "end" ? "justify-end" : "justify-start",
    slide.align === "center" ? "text-center" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Scrim div shared by the homepage slider and the admin preview. */
export function slideScrim(slide: HeroSlide): { className: string; style: CSSProperties } {
  return slide.overlay_color
    ? {
        className: "absolute inset-0",
        style: { backgroundColor: slide.overlay_color, opacity: slide.overlay / 100 },
      }
    : {
        className: "absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/20",
        style: { opacity: slide.overlay / 100 },
      };
}

/**
 * Text + buttons of one slide. Shared between the live homepage slider and the
 * admin preview so what you edit is exactly what ships. Honors per-slide
 * visibility toggles, typography overrides and button colors.
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

  // Legacy JSON passes through normalizeSlide, so these are always present —
  // the !== false guards just make the component tolerant to hand-made objects.
  const showTitle = slide.show_title !== false;
  const showText = slide.show_text !== false;
  const showBtns = slide.show_btns !== false;

  const scale = compact ? COMPACT_SCALE : 1;

  const titleStyle: CSSProperties = {
    ...(slide.title_color ? { color: slide.title_color } : {}),
    ...(slide.title_size
      ? { fontSize: `${Math.round(slide.title_size * scale)}px` }
      : {}),
    ...(slide.title_underline
      ? {
          textDecoration: "underline",
          textUnderlineOffset: "0.12em",
          textDecorationThickness: "2px",
        }
      : {}),
  };

  const textStyle: CSSProperties = {
    ...(slide.text_color ? { color: slide.text_color } : {}),
    ...(slide.text_size ? { fontSize: `${Math.round(slide.text_size * scale)}px` } : {}),
  };

  const btn1Style: CSSProperties = {
    ...(slide.btn1_bg ? { backgroundColor: slide.btn1_bg } : {}),
    ...(slide.btn1_color ? { color: slide.btn1_color } : {}),
  };
  const btn2Style: CSSProperties = {
    ...(slide.btn2_bg ? { backgroundColor: slide.btn2_bg, borderColor: "transparent" } : {}),
    ...(slide.btn2_color ? { color: slide.btn2_color } : {}),
  };

  if (
    (!title || !showTitle) &&
    (!text || !showText) &&
    (!btn1 || !showBtns) &&
    (!btn2 || !showBtns)
  ) {
    return null;
  }

  const ar = lang === "ar" ? "ar" : "";

  return (
    <div className={`space-y-3 ${compact ? "text-[13px]" : ""}`}>
      {title && showTitle && (
        <h2
          className={`leading-tight text-white ${ar} ${
            slide.title_font === "body" ? "font-body" : "font-display"
          } ${slide.title_bold === false ? "font-normal" : "font-bold"} ${
            compact ? "text-[18px]" : "text-[28px] md:text-[40px]"
          }`}
          style={titleStyle}
        >
          {title}
        </h2>
      )}
      {text && showText && (
        <p
          className={`text-white/85 max-w-lg ${ar} ${slide.text_font === "display" ? "font-display" : ""} ${
            compact ? "text-[12.5px]" : "text-[15px] md:text-[17px]"
          }`}
          style={textStyle}
        >
          {text}
        </p>
      )}
      {showBtns && (btn1 || btn2) && (
        <div className={`flex flex-wrap gap-3 ${compact ? "pt-1" : "pt-2"}`}>
          {btn1 && slide.btn_href && (
            <Link
              href={slide.btn_href}
              className={`btn bg-white text-ink hover:bg-cream ${compact ? "!px-4 !py-2.5 !text-[10px]" : ""}`}
              style={Object.keys(btn1Style).length ? btn1Style : undefined}
            >
              {btn1}
              <ArrowRight size={13} weight="bold" className="rtl:rotate-180" />
            </Link>
          )}
          {btn2 && slide.btn2_href && (
            <Link
              href={slide.btn2_href}
              className={`btn border-white text-white hover:bg-white hover:text-ink ${compact ? "!px-4 !py-2.5 !text-[10px]" : ""}`}
              style={Object.keys(btn2Style).length ? btn2Style : undefined}
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
                className="object-contain"
                priority={i === 0}
              />
            )}
            <div
              className={slideScrim(s).className}
              style={slideScrim(s).style}
              aria-hidden
            />
            <div
              className={`relative h-full mx-auto max-w-6xl px-4 lg:px-6 flex ${slidePlacementClasses(s)} ${
                s.align === "center" ? "" : lang === "ar" ? "text-right" : ""
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
