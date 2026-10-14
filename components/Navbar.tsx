"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaretDown, Heart, List, MagnifyingGlass, X } from "@phosphor-icons/react";
import { useCart, useFavs, useLang, useSettings } from "@/components/providers";
import { BrandMark, Wordmark } from "@/components/BrandMark";
import { formatPrice } from "@/lib/i18n";
import { countMatches, searchProducts } from "@/lib/search";
import type { Category, Product } from "@/lib/types";

const NAV = [
  { key: "nav.shop", href: "/shop" },
  { key: "nav.new", href: "/shop?sort=new" },
  { key: "nav.best", href: "/shop?sort=best" },
  { key: "nav.faq", href: "/faq" },
  { key: "nav.contact", href: "/contact" },
] as const;

export function Navbar({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const { lang, setLang, t } = useLang();
  const settings = useSettings();
  const { count } = useCart();
  const { count: favCount } = useFavs();
  const router = useRouter();

  const [drawer, setDrawer] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  const deferredQ = useDeferredValue(q);
  const results = useMemo(
    () => (search ? searchProducts(products, categories, deferredQ, 6) : []),
    [search, products, categories, deferredQ]
  );
  const totalMatches = useMemo(
    () =>
      search && deferredQ.trim()
        ? countMatches(products, categories, deferredQ)
        : 0,
    [search, products, categories, deferredQ]
  );

  useEffect(() => {
    if (search) searchInput.current?.focus();
  }, [search]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const value = q.trim();
    setSearch(false);
    router.push(value ? `/shop?q=${encodeURIComponent(value)}` : "/shop");
  }

  return (
    <>
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-ink focus:text-white focus:rounded-full focus:font-bold"
    >
      {t("a11y.skip")}
    </a>
        <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-6xl px-4 lg:px-6 h-16 md:h-[72px] flex items-center gap-3">
        {/* mobile: menu */}
        <button
          type="button"
          className="lg:hidden w-11 h-11 -ms-1 flex items-center justify-center"
          aria-label={t("nav.menu")}
          onClick={() => {
            setDrawer(true);
            setCatsOpen(false);
          }}
        >
          <List size={26} weight="bold" />
        </button>

        {/* logo */}
        <Link href="/" className="flex items-center shrink-0 py-1.5">
          <BrandMark className="h-9 w-auto md:h-10 shrink-0" />
        </Link>

        {/* desktop nav */}
        <nav className="hidden lg:flex items-center gap-5 mx-auto text-[14px] font-bold whitespace-nowrap">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="hover:text-primary transition-colors py-2"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        {/* right icons */}
        <div className="flex items-center gap-1 sm:gap-2 ms-auto lg:ms-0">
          <button
            type="button"
            aria-label={t("search.open")}
            className="w-11 h-11 flex items-center justify-center hover:text-primary"
            onClick={() => setSearch((s) => !s)}
          >
            <MagnifyingGlass size={21} weight="bold" />
          </button>

          <button
            type="button"
            className="hidden sm:flex items-center text-[13.5px] font-extrabold border border-line rounded-full px-3 h-11 hover:border-ink"
            onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
            aria-label={`Langue ${lang === "fr" ? "FR / عربي" : "عربي / FR"}`}
          >
            {lang === "fr" ? "FR / عربي" : "عربي / FR"}
          </button>

          <Link
            href="/favorites"
            aria-label={t("nav.fav")}
            className="relative w-11 h-11 flex items-center justify-center hover:text-primary"
          >
            <Heart size={22} weight="bold" />
            {favCount > 0 && (
              <span
                key={favCount}
                className="absolute -top-0.5 -end-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-primary text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-milk anim-pop"
              >
                {favCount}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            aria-label={t("cart.title")}
            className="relative w-11 h-11 flex items-center justify-center hover:text-primary"
          >
            <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {count > 0 && (
              <span
                key={count}
                className="absolute -top-0.5 -end-0.5 min-w-[19px] h-[19px] px-1 rounded-full bg-primary text-white text-[11px] font-extrabold flex items-center justify-center border-2 border-milk anim-pop"
              >
                {count}
              </span>
            )}
          </Link>

          <a
            href={`https://wa.me/${settings.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-2 rounded-full bg-wa text-ink px-4 h-10 text-[13.5px] font-bold shadow-pop-sm hover:opacity-95"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
            </svg>
            {t("wa.short")}
          </a>
        </div>
      </div>

      {/* search overlay */}
      <div
        data-motion="soft"
        className={`absolute inset-x-0 top-full bg-milk border-b-2 border-line shadow-lg origin-top will-change-transform transition-[opacity,translate,visibility] ${
          search
            ? "visible opacity-100 translate-y-0 duration-[280ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
            : "invisible opacity-0 -translate-y-3 duration-[220ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        }`}
      >
        <form
          onSubmit={submitSearch}
          className={`mx-auto max-w-6xl px-4 lg:px-6 py-4 flex flex-col sm:flex-row gap-2 ${
            search ? "anim-rise" : ""
          }`}
          style={search ? { animationDelay: "90ms" } : undefined}
        >
          <input
            ref={searchInput}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            className="field flex-1 min-w-0 px-4 py-3"
          />
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1 sm:flex-none">
              {t("search.submit")}
            </button>
            <button
              type="button"
              aria-label={t("nav.close")}
              onClick={() => setSearch(false)}
              className="w-11 h-11 shrink-0 flex items-center justify-center"
            >
              <X size={22} weight="bold" />
            </button>
          </div>
        </form>

        {/* live results */}
        {search && deferredQ.trim() && (
          <div
            className="mx-auto max-w-6xl px-4 lg:px-6 pb-4"
            aria-live="polite"
          >
            {results.length === 0 ? (
              <p className="text-[14px] text-ink-soft py-2 border-t border-line">
                {t("shop.noResults")}
              </p>
            ) : (
              <>
                <ul className="max-h-[55vh] overflow-y-auto overscroll-contain border-t border-line pt-2">
                  {results.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/product/${p.slug}`}
                        onClick={() => {
                          setSearch(false);
                          setQ("");
                        }}
                        className="flex items-center gap-3 px-2 py-2 rounded-[10px] hover:bg-highlight/20"
                      >
                        <span className="relative w-12 h-12 shrink-0 rounded-[8px] overflow-hidden bg-highlight/30 border border-line block">
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-display font-bold text-[14.5px] leading-tight truncate">
                            {lang === "ar" ? p.name_ar : p.name_fr}
                          </span>
                          {p.old_price && (
                            <span className="block text-[12px] text-ink-soft line-through">
                              {formatPrice(p.old_price, lang)}
                            </span>
                          )}
                        </span>
                        <span className="price text-[14px] shrink-0">
                          {formatPrice(p.price, lang)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-line mt-1 pt-2 text-center">
                  <Link
                    href={`/shop?q=${encodeURIComponent(deferredQ.trim())}`}
                    onClick={() => {
                      setSearch(false);
                      setQ("");
                    }}
                    className="inline-block py-1.5 text-[14px] font-bold text-primary hover:underline underline-offset-2"
                  >
                    {t("search.allResults")} ({totalMatches})
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

    </header>

      {/* mobile drawer */}
      <div
        data-motion="soft"
        className={`lg:hidden fixed inset-0 z-50 flex transition-[opacity,visibility] ${
          drawer
            ? "visible opacity-100 duration-[350ms]"
            : "invisible opacity-0 duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        }`}
      >
        <div
          className={`w-[86%] max-w-sm bg-milk border-e-2 border-line flex flex-col overflow-hidden will-change-transform transition-transform ${
            drawer
              ? "translate-x-0 duration-[350ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
              : "-translate-x-full rtl:translate-x-full duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          }`}
        >
            <div
              className={`shrink-0 flex items-center justify-between px-5 h-16 border-b-2 border-line ${
                drawer ? "anim-rise" : ""
              }`}
              style={drawer ? { animationDelay: "50ms" } : undefined}
            >
              <span className="flex items-center gap-2.5">
                <BrandMark className="h-8 w-auto shrink-0" />
                <Wordmark className="h-[12px] w-auto" />
              </span>
              <button
                type="button"
                aria-label={t("nav.close")}
                onClick={() => setDrawer(false)}
                className="w-11 h-11 flex items-center justify-center"
              >
                <X size={24} weight="bold" />
              </button>
            </div>

            <nav className="shrink-0 px-5 py-4 flex flex-col gap-1 border-b-2 border-line">
              {NAV.map((item, i) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setDrawer(false)}
                  className={`font-display font-bold text-[17px] py-2.5 hover:text-primary ${
                    drawer ? "anim-rise" : ""
                  }`}
                  style={drawer ? { animationDelay: `${90 + i * 35}ms` } : undefined}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>

            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <button
                type="button"
                aria-expanded={catsOpen}
                onClick={() => setCatsOpen((v) => !v)}
                className={`shrink-0 flex items-center justify-between px-5 py-4 w-full ${
                  drawer ? "anim-rise" : ""
                }`}
                style={drawer ? { animationDelay: "240ms" } : undefined}
              >
                <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-ink-soft">
                  {t("nav.allCategories")}
                </span>
                <CaretDown
                  size={16}
                  weight="bold"
                  className={`transition-transform duration-200 ${catsOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`flex-1 min-h-0 grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  catsOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="h-full overflow-y-auto overscroll-contain px-5 pb-4">
                    <div
                      className={`flex flex-col gap-1 transition-opacity duration-200 ${
                        catsOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/shop?cat=${c.slug}`}
                          onClick={() => setDrawer(false)}
                          className="flex items-center gap-3 py-2 text-[15px] font-bold hover:text-primary"
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ background: c.color }}
                          />
                          <span>{lang === "ar" ? c.name_ar : c.name_fr}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`shrink-0 mt-auto px-5 py-5 border-t-2 border-line space-y-3 ${
                drawer ? "anim-rise" : ""
              }`}
              style={drawer ? { animationDelay: "330ms" } : undefined}
            >
              <button
                type="button"
                className="chip w-full justify-center"
                onClick={() => setLang(lang === "fr" ? "ar" : "fr")}
              >
                {lang === "fr" ? "العربية" : "Français"}
              </button>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-wa w-full"
              >
                {t("wa.cta")}
              </a>
            </div>
          </div>
        <div
          className={`flex-1 bg-ink/50 backdrop-blur-[2px] transition-opacity ${
            drawer
              ? "opacity-100 duration-[350ms]"
              : "opacity-0 duration-[300ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          }`}
          onClick={() => setDrawer(false)}
          aria-hidden="true"
        />
        </div>
    </>
  );
}
