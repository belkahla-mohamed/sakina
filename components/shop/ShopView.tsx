"use client";

import { useMemo, useState } from "react";
import { useLang } from "@/components/providers";
import { ProductCard } from "@/components/ProductCard";
import { matchesProduct } from "@/lib/search";
import type { Category, Product } from "@/lib/types";

type Sort = "default" | "price_asc" | "price_desc" | "new";

interface Initial {
  q: string;
  cat: string;
  sort: string;
}

export function ShopView({
  products,
  categories,
  initial,
  autoRotate = true,
}: {
  products: Product[];
  categories: Category[];
  initial: Initial;
  autoRotate?: boolean;
}) {
  const { lang, t } = useLang();
  const [q, setQ] = useState(initial.q);
  const [cat, setCat] = useState(initial.cat);
  const [sort, setSort] = useState<Sort>(
    (["default", "price_asc", "price_desc", "new"] as string[]).includes(initial.sort)
      ? (initial.sort as Sort)
      : "default"
  );

  const filtered = useMemo(() => {
    let list = [...products];
    if (cat) list = list.filter((p) => p.category === cat);
    if (q.trim()) list = list.filter((p) => matchesProduct(p, q));
    switch (sort) {
      case "price_asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "new":
        list.sort((a, b) => Number(b.is_new) - Number(a.is_new));
        break;
      default:
        list.sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller));
    }
    return list;
  }, [products, cat, q, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-6 py-8 md:py-12 anim-fade-up">
      <h1 className="text-[30px] md:text-[38px] font-bold">{t("shop.title")}</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mt-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("search.placeholder")}
          className="field flex-1 min-w-0 px-4 py-3 outline-none focus:border-ink"
        />

        <div className="flex items-center gap-2">
          <label className="text-[13px] font-bold text-ink-soft" htmlFor="sort-select">
            {t("shop.sort")}
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="px-3 py-2.5 text-[16px] font-bold bg-white"
            style={{ border: "2px solid var(--color-line)", borderRadius: "999px" }}
          >
            <option value="default">{t("shop.sort_default")}</option>
            <option value="price_asc">{t("shop.sort_price_asc")}</option>
            <option value="price_desc">{t("shop.sort_price_desc")}</option>
            <option value="new">{t("shop.sort_new")}</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mt-4 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap overflow-x-auto md:overflow-visible overscroll-x-contain scroll-smooth pb-1.5 md:pb-0 [touch-action:pan-x_pinch-zoom] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [-webkit-mask-image:linear-gradient(to_right,transparent,#000_14px,#000_calc(100%-28px),transparent)] [mask-image:linear-gradient(to_right,transparent,#000_14px,#000_calc(100%-28px),transparent)] md:[-webkit-mask-image:none] md:[mask-image:none]">
        <button type="button" className="chip shrink-0" data-active={cat === ""} onClick={() => setCat("")}>
          {t("shop.all")}
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            className="chip shrink-0"
            data-active={cat === c.slug}
            onClick={() => setCat(cat === c.slug ? "" : c.slug)}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
            {lang === "ar" ? c.name_ar : c.name_fr}
          </button>
        ))}
      </div>

      <p key={filtered.length} className="text-[13.5px] font-bold text-ink-soft mt-5 anim-fade-in">
        {filtered.length} {t("shop.results")}
      </p>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center mt-3 anim-fade-up">
          <p className="font-display font-bold text-[18px]">{t("shop.noResults")}</p>
        </div>
      ) : (
        <div
          key={`${cat}|${sort}`}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-3"
        >
          {filtered.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} autoRotate={autoRotate} />
          ))}
        </div>
      )}
    </div>
  );
}
