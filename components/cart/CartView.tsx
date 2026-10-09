"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, useLang } from "@/components/providers";
import { formatPrice } from "@/lib/i18n";
import { buildLines, computeTotals, FREE_SHIPPING_FROM } from "@/lib/whatsapp";
import { WaIcon } from "@/components/WaIcon";
import type { Product } from "@/lib/types";

export function CartView({ products }: { products: Product[] }) {
  const { lang, t } = useLang();
  const { entries, setQty, remove, count } = useCart();

  const lines = buildLines(entries, products);
  const totals = computeTotals(lines);
  const missingForFree = Math.max(0, FREE_SHIPPING_FROM - totals.subtotal);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 lg:px-6 py-16 text-center">
        <div className="card p-10 anim-fade-up">
          <p className="font-display text-[24px] font-bold">{t("cart.empty")}</p>
          <Link href="/shop" className="btn btn-primary mt-5 inline-flex">
            {t("cart.back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-6 py-8 md:py-12 anim-fade-up">
      <h1 className="text-[30px] md:text-[38px] font-bold">{t("cart.title")}</h1>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 mt-6 items-start">
        <div className="space-y-3">
          {lines.map(({ product, qty }, i) => (
            <div
              key={product.slug}
              className="card p-3.5 flex flex-wrap gap-4 items-center anim-fade-up"
              style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}
            >
              <Link
                href={`/product/${product.slug}`}
                className="relative w-24 h-20 shrink-0 rounded-[14px] overflow-hidden bg-highlight/30 block"
              >
                <Image
                  src={product.image}
                  alt={lang === "ar" ? product.name_ar : product.name_fr}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex-1 min-w-[140px] sm:min-w-0">
                <Link href={`/product/${product.slug}`} className="leading-tight block">
                  <p className="font-display font-bold text-[15px] line-clamp-2 sm:truncate">
                    {lang === "ar" ? product.name_ar : product.name_fr}
                  </p>
                </Link>
                <p className="price text-[15.5px] mt-1">{formatPrice(product.price, lang)}</p>
              </div>

              <div className="w-full flex items-center justify-end gap-3 sm:w-auto sm:flex-col sm:items-end sm:justify-start sm:gap-2">
                <div dir="ltr" className="flex items-center border-2 border-line rounded-full bg-white overflow-hidden">
                  <button
                    type="button"
                    className="w-10 h-10 font-bold hover:bg-milk"
                    onClick={() => setQty(product.slug, qty - 1)}
                    aria-label={t("a11y.qtyDec")}
                  >
                    −
                  </button>
                  <span key={qty} className="w-8 text-center text-[14px] font-extrabold anim-bump">{qty}</span>
                  <button
                    type="button"
                    className="w-10 h-10 font-bold hover:bg-milk"
                    onClick={() => setQty(product.slug, qty + 1)}
                    aria-label={t("a11y.qtyInc")}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(product.slug)}
                  className="min-h-[40px] px-1 text-[12.5px] font-bold text-ink-soft hover:text-primary underline underline-offset-2"
                >
                  {t("cart.remove")}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-5 sticky top-24">
          <p className="font-display text-[19px] font-bold">{t("order.recap")}</p>

          <div className="mt-4 space-y-2 text-[15px]">
            <div className="flex justify-between">
              <span className="text-ink-soft">{t("cart.subtotal")}</span>
              <span className="price">{formatPrice(totals.subtotal, lang)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">{t("cart.shipping")}</span>
              <span className="price">
                {totals.shipping === 0 ? t("cart.free") : formatPrice(totals.shipping, lang)}
              </span>
            </div>
            <div className="flex justify-between border-t-2 border-line pt-3 text-[18px]">
              <span className="font-bold">{t("cart.total")}</span>
              <span key={totals.total} className="price text-primary anim-bump">
                {formatPrice(totals.total, lang)}
              </span>
            </div>
          </div>

          {missingForFree > 0 && (
            <p className="text-[13px] mt-3 bg-highlight/40 border-2 border-line rounded-[14px] p-3 anim-fade-up">
              {lang === "ar"
                ? `أضف ${formatPrice(missingForFree, "ar")} أخرى لتحصل على توصيل مجاني.`
                : `Encore ${formatPrice(missingForFree, "fr")} pour la livraison gratuite.`}
            </p>
          )}

          <Link href="/checkout" className="btn btn-wa w-full mt-4">
            <WaIcon size={20} />
            {t("cart.checkout")}
          </Link>
          <Link
            href="/shop"
            className="block text-center py-1.5 text-[14px] font-bold text-ink-soft hover:text-primary mt-3 underline underline-offset-2"
          >
            {t("cart.back")} ({count})
          </Link>
        </div>
      </div>
    </div>
  );
}
