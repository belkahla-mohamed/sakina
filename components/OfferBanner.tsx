"use client";

import Image from "next/image";
import { useLang } from "@/components/providers";
import type { Offer } from "@/lib/types";

/**
 * Storefront offer banner — mirrors `OfferPreview` in the admin editor:
 * fonts, colors and visibility flags come from the offer itself.
 */
function fontOf(choice: string, lang: string, fallbackDisplay: boolean): string {
  if (choice === "display") return "var(--font-display)";
  if (choice === "body") return "var(--font-body)";
  return lang === "ar"
    ? "var(--font-arabic)"
    : fallbackDisplay
      ? "var(--font-display)"
      : "var(--font-body)";
}

export function OfferBanner({
  offer,
  flip = false,
}: {
  offer: Offer;
  /** Flip the image side on desktop (alternating layout for consecutive banners). */
  flip?: boolean;
}) {
  const { lang } = useLang();
  const ar = lang === "ar";
  const title = ar ? offer.title_ar : offer.title_fr;
  const text = ar ? offer.text_ar : offer.text_fr;
  const btn = ar ? offer.btn_label_ar : offer.btn_label_fr;
  const badge =
    offer.discount_type === "percent"
      ? `-${offer.discount_value}%`
      : `-${offer.discount_value} DH`;

  const panelStyles: React.CSSProperties = {};
  if (offer.bg_color) {
    panelStyles.backgroundColor = offer.bg_color;
    if (offer.bg_opacity) panelStyles.opacity = offer.bg_opacity / 100;
  }
  if (offer.bg_shadow) {
    const a = offer.bg_shadow_opacity / 100;
    const [r, g, b] = [
      offer.bg_shadow.slice(1, 3),
      offer.bg_shadow.slice(3, 5),
      offer.bg_shadow.slice(5, 7),
    ].map((h) => parseInt(h, 16));
    panelStyles.boxShadow = `0 12px 32px rgba(${r},${g},${b},${a * 0.55})`;
  }

  const alignClass =
    offer.align === "center"
      ? "items-center text-center"
      : offer.align === "end"
        ? "items-end text-end"
        : "items-start text-start";
  const valignClass = offer.valign === "center" ? "justify-center" : "justify-end";

  return (
    <article
      className="card overflow-hidden grid md:grid-cols-2 items-stretch"
      style={panelStyles}
    >
      <div
        className={`relative min-h-[240px] md:min-h-[320px] bg-milk ${
          flip ? "md:order-2" : ""
        }`}
      >
        {offer.image ? (
          <Image
            src={offer.image}
            alt={title || "Offer"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : null}
        {offer.image && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/20 to-transparent" />
        )}
        {offer.discount_value > 0 && (
          <span className="absolute top-3 start-3 bg-primary text-white rounded-full px-3 py-1 text-[12px] font-extrabold">
            {badge}
          </span>
        )}
      </div>

      <div className={`p-6 md:p-8 flex flex-col ${alignClass} ${valignClass}`}>
        {offer.show_title && title && (
          <h3
            className="font-bold leading-snug text-[24px] md:text-[28px]"
            style={{
              fontFamily: fontOf(offer.title_font, lang, true),
              fontWeight: offer.title_bold ? 700 : 400,
              textDecoration: offer.title_underline ? "underline" : "none",
              fontSize: offer.title_size ? `${offer.title_size}px` : undefined,
              color: offer.title_color || undefined,
            }}
          >
            {title}
          </h3>
        )}
        {offer.show_text && text && (
          <p
            className="mt-3 text-[15px] text-ink-soft leading-relaxed"
            style={{
              fontFamily: fontOf(offer.text_font, lang, false),
              fontSize: offer.text_size ? `${offer.text_size}px` : undefined,
              color: offer.text_color || undefined,
            }}
          >
            {text}
          </p>
        )}
        {offer.show_btns && btn && (
          <div className="mt-5">
            <a
              href={offer.btn_href || "/shop"}
              className="inline-flex items-center gap-1.5 rounded-[10px] px-5 py-2.5 text-[14px] font-bold text-white bg-primary hover:opacity-95"
              style={{
                backgroundColor: offer.btn1_bg || undefined,
                color: offer.btn1_color || undefined,
              }}
            >
              {btn}
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
