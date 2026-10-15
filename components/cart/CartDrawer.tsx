"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "@phosphor-icons/react";
import { useCart, useLang, useSettings } from "@/components/providers";
import { formatPrice } from "@/lib/i18n";
import { buildLines, computeTotals } from "@/lib/whatsapp";
import { WaIcon } from "@/components/WaIcon";
import type { Product } from "@/lib/types";

/**
 * Slide-in cart drawer. Replaces the old /cart page — opens from the cart
 * icon in the navbar and automatically whenever a product is added.
 */
export function CartDrawer({ products }: { products: Product[] }) {
  const { lang, t } = useLang();
  const settings = useSettings();
  const { entries, setQty, remove, count, isOpen, close } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  const lines = buildLines(entries, products);
  const totals = computeTotals(lines, settings.freeShippingFrom);
  const missingForFree = Math.max(0, settings.freeShippingFrom - totals.subtotal);

  // Escape closes; focus moves into the panel on open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // Allow the open transition to start before focusing.
    const raf = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [isOpen, close]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        data-motion="soft"
        className={`absolute inset-0 bg-ink/45 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel — slides from the inline-end (right in FR, left in AR) */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.title")}
        tabIndex={-1}
        data-motion="soft"
        className={`absolute inset-y-0 end-0 w-full max-w-[400px] bg-cream border-s border-line shadow-2xl flex flex-col outline-none transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <p className="font-display text-[19px] font-bold">
            {t("cart.title")}
            {count > 0 && (
              <span className="ms-2 text-[13px] font-bold text-ink-soft">({count})</span>
            )}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label={t("nav.close")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-milk"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="font-display text-[20px] font-bold">{t("cart.empty")}</p>
            <Link href="/shop" onClick={close} className="btn btn-primary">
              {t("cart.back")}
            </Link>
          </div>
        ) : (
          <>
            {/* Lines */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {lines.map(({ product, qty }) => (
                <div
                  key={product.slug}
                  className="flex gap-3 p-2.5 border border-line rounded-[12px] bg-white"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={close}
                    className="relative w-16 h-16 shrink-0 rounded-[8px] overflow-hidden bg-highlight/30 block"
                  >
                    <Image
                      src={product.image}
                      alt={lang === "ar" ? product.name_ar : product.name_fr}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={close}
                      className="block leading-tight"
                    >
                      <p className="font-bold text-[13.5px] line-clamp-2">
                        {lang === "ar" ? product.name_ar : product.name_fr}
                      </p>
                    </Link>
                    <p className="price text-[14px] mt-0.5">
                      {formatPrice(product.price, lang)}
                    </p>

                    <div className="flex items-center justify-between mt-1.5">
                      <div
                        dir="ltr"
                        className="flex items-center border border-line rounded-full bg-cream overflow-hidden"
                      >
                        <button
                          type="button"
                          className="w-8 h-8 font-bold hover:bg-milk"
                          onClick={() => setQty(product.slug, qty - 1)}
                          aria-label={t("a11y.qtyDec")}
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-[13px] font-extrabold">
                          {qty}
                        </span>
                        <button
                          type="button"
                          className="w-8 h-8 font-bold hover:bg-milk"
                          onClick={() => setQty(product.slug, qty + 1)}
                          aria-label={t("a11y.qtyInc")}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(product.slug)}
                        className="text-[12px] font-bold text-ink-soft hover:text-primary underline underline-offset-2"
                      >
                        {t("cart.remove")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: totals + checkout */}
            <div className="border-t border-line p-4 space-y-2 bg-cream">
              <div className="flex justify-between text-[14px]">
                <span className="text-ink-soft">{t("cart.subtotal")}</span>
                <span className="price">{formatPrice(totals.subtotal, lang)}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-ink-soft">{t("cart.shipping")}</span>
                <span className="price">
                  {totals.shipping === 0
                    ? t("cart.free")
                    : formatPrice(totals.shipping, lang)}
                </span>
              </div>
              <div className="flex justify-between border-t-2 border-line pt-2 text-[17px]">
                <span className="font-bold">{t("cart.total")}</span>
                <span className="price text-primary">
                  {formatPrice(totals.total, lang)}
                </span>
              </div>

              {missingForFree > 0 && (
                <p className="text-[12.5px] bg-highlight/15 border border-highlight/40 rounded-[10px] p-2.5">
                  {lang === "ar"
                    ? `أضف ${formatPrice(missingForFree, "ar")} أخرى لتحصل على توصيل مجاني.`
                    : `Encore ${formatPrice(missingForFree, "fr")} pour la livraison gratuite.`}
                </p>
              )}

              <Link
                href="/cart"
                onClick={close}
                className="btn btn-outline w-full"
              >
                {t("cart.view")}
              </Link>
              <Link
                href="/checkout"
                onClick={close}
                className="btn btn-wa w-full"
              >
                <WaIcon size={20} />
                {t("cart.checkout")}
              </Link>
              <button
                type="button"
                onClick={close}
                className="block w-full py-1.5 text-[13.5px] font-bold text-ink-soft hover:text-primary underline underline-offset-2"
              >
                {t("cart.back")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
