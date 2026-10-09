"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Star, Truck, Wallet, ArrowCounterClockwise } from "@phosphor-icons/react";
import { useCart, useLang } from "@/components/providers";
import { formatPrice, type TKey } from "@/lib/i18n";
import type { Product } from "@/lib/types";

export function ProductView({ product, related }: { product: Product; related: Product[] }) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = product.badge === "epuise" || product.stock <= 0;
  const trust: { icon: typeof Truck; k: TKey }[] = [
    { icon: Truck, k: "home.trust1" },
    { icon: Wallet, k: "home.trust2" },
    { icon: ArrowCounterClockwise, k: "home.trust3" },
  ];

  function handleAdd() {
    if (soldOut) return;
    add(product.slug, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  }

  function handleBuyNow() {
    if (soldOut) return;
    add(product.slug, qty);
    router.push("/checkout");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-6 py-8 md:py-12 anim-fade-up">
      <nav className="text-[13px] text-ink-soft flex items-center gap-1.5 mb-6">
        <Link href="/" className="hover:text-primary font-bold py-1">
          {lang === "ar" ? "الرئيسية" : "Accueil"}
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-primary font-bold py-1">
          {t("nav.shop")}
        </Link>
        <span>/</span>
        <span className="truncate max-w-[40vw]">{lang === "ar" ? product.name_ar : product.name_fr}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-7 lg:gap-10">
        <div
          className="card overflow-hidden relative aspect-[4/3] bg-highlight/30 anim-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          <Image
            src={product.image}
            alt={lang === "ar" ? product.name_ar : product.name_fr}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          {product.badge && (
            <span className="absolute top-3 start-3 bg-primary text-white border-2 border-ink rounded-full px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.06em]">
              {product.badge === "promo"
                ? t("product.promo")
                : product.badge === "nouveau"
                  ? t("product.new")
                  : t("product.soldout")}
            </span>
          )}
        </div>

        <div className="anim-fade-up" style={{ animationDelay: "120ms" }}>
          <h1 className="text-[28px] md:text-[34px] font-bold leading-tight">
            {lang === "ar" ? product.name_ar : product.name_fr}
          </h1>

          <div className="flex items-center gap-2 mt-3 text-[13.5px]">
            <span className="flex gap-0.5 text-highlight">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} weight="fill" />
              ))}
            </span>
            <span className="font-extrabold">{product.rating.toFixed(1)}</span>
            <span className="text-ink-soft">
              ({product.reviews} {t("product.reviews")})
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-4">
            <span className="price text-[32px] text-primary">{formatPrice(product.price, lang)}</span>
            {product.old_price && (
              <span className="text-[17px] line-through text-ink-soft whitespace-nowrap">
                {formatPrice(product.old_price, lang)}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
            <div dir="ltr" className="flex items-center border-2 border-line rounded-full bg-white overflow-hidden self-stretch sm:self-auto justify-between sm:justify-start">
              <button
                type="button"
                className="flex-1 sm:flex-none w-10 h-11 font-bold text-[17px] hover:bg-milk"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                aria-label={t("a11y.qtyDec")}
              >
                −
              </button>
              <span key={qty} className="w-9 text-center font-extrabold anim-bump">{qty}</span>
              <button
                type="button"
                className="flex-1 sm:flex-none w-10 h-11 font-bold text-[17px] hover:bg-milk"
                onClick={() => setQty((v) => Math.min(20, v + 1))}
                aria-label={t("a11y.qtyInc")}
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              className={`btn flex-1 ${soldOut ? "btn-outline opacity-60" : added ? "btn-secondary" : "btn-primary"}`}
            >
              {soldOut ? (
                t("product.out")
              ) : (
                <span className={`inline-flex items-center gap-1.5 ${added ? "anim-pop" : ""}`}>
                  {added ? (
                    <>
                      <Check size={17} weight="bold" /> {t("product.added")}
                    </>
                  ) : (
                    t("product.add")
                  )}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={soldOut}
            className={`btn btn-outline w-full mt-3 ${soldOut ? "opacity-60" : ""}`}
          >
            {t("product.buyNow")}
          </button>

          <ul className="mt-6 space-y-2">
            {trust.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.k} className="flex items-center gap-2.5 text-[14.5px]">
                  <span className="w-8 h-8 rounded-full bg-highlight border-2 border-ink flex items-center justify-center shrink-0">
                    <Icon size={15} weight="bold" />
                  </span>
                  {t(item.k)}
                </li>
              );
            })}
          </ul>

          <div className="mt-6 pt-5 border-t-2 border-line">
            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-ink-soft mb-2">
              {t("product.desc")}
            </p>
            <p className={`text-[15.5px] leading-relaxed ${lang === "ar" ? "ar" : ""}`}>
              {lang === "ar" ? product.desc_ar : product.desc_fr}
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-[26px] font-bold mb-4">{t("product.related")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p, i) => (
              <RelatedCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RelatedCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const soldOut = product.badge === "epuise" || product.stock <= 0;

  return (
    <div
      className="card overflow-hidden flex flex-col hover:-translate-y-1 anim-fade-up"
      style={{ animationDelay: `${Math.min(index, 7) * 60}ms` }}
    >
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/3] block bg-highlight/30">
        <Image
          src={product.image}
          alt={lang === "ar" ? product.name_ar : product.name_fr}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
      </Link>
      <div className="p-3.5 flex flex-col flex-1">
        <Link href={`/product/${product.slug}`}>
          <p className="font-display font-bold text-[14.5px] leading-tight line-clamp-1">
            {lang === "ar" ? product.name_ar : product.name_fr}
          </p>
        </Link>
        <span className="price text-[16px] mt-1.5">{formatPrice(product.price, lang)}</span>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => add(product.slug, 1)}
          className="btn btn-primary text-[13.5px] mt-2.5 w-full py-2"
        >
          {soldOut ? (
            t("product.out")
          ) : (
            <>
              <span className="sm:hidden">{t("product.add_short")}</span>
              <span className="hidden sm:inline">{t("product.add")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
