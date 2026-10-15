"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Check, LinkSimple, MagnifyingGlass, PencilSimple, Trash } from "@phosphor-icons/react";
import { deleteProduct, deleteProducts, type ActionState } from "@/app/admin/actions";
import { useConfirm, useToast } from "@/components/admin/Toast";
import { useActionToast } from "@/components/admin/useActionToast";
import { useLang } from "@/components/providers";
import type { Category, Product } from "@/lib/types";

const BADGE_STYLE: Record<string, string> = {
  promo: "bg-primary text-white",
  nouveau: "bg-sand text-ink border border-line",
  epuise: "bg-ink text-white",
};

function formatPrice(n: number): string {
  return `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ")} dh`;
}

const COLS = "md:grid-cols-[24px_minmax(0,2.6fr)_minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.9fr)_230px]";

export function ProductTable({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(
    deleteProduct,
    {}
  );
  const [bulkState, bulkAction, bulkPending] = useActionState<ActionState, FormData>(
    deleteProducts,
    {}
  );
  useActionToast(deleteState);
  useActionToast(bulkState);
  const askConfirm = useConfirm();
  const toast = useToast();
  const { t, lang } = useLang();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/product/${slug}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers / non-secure contexts.
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopiedSlug(slug);
      toast.success(t("admin.msg.linkCopied"), t("admin.msg.linkCopiedSol"));
      window.setTimeout(() => setCopiedSlug((c) => (c === slug ? null : c)), 1500);
    } catch {
      toast.error(t("admin.msg.linkCopyFail"), t("admin.msg.linkCopyFailSol"));
    }
  }

  const allSlugs = useMemo(() => new Set(products.map((p) => p.slug)), [products]);
  const bulkSlugs = useMemo(
    () => [...selected].filter((s) => allSlugs.has(s)),
    [selected, allSlugs]
  );

  const BADGE_LABEL: Record<string, string> = {
    promo: t("admin.form.badgePromo"),
    nouveau: t("admin.form.badgeNew"),
    epuise: t("admin.form.badgeOut"),
  };
  const pname = (p: Product) => (lang === "ar" ? p.name_ar : p.name_fr);

  const catName = useMemo(() => {
    const m = new Map(categories.map((c) => [c.slug, lang === "ar" ? c.name_ar : c.name_fr]));
    return (slug: string) => m.get(slug) ?? slug;
  }, [categories, lang]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (!needle) return true;
      return (
        p.name_fr.toLowerCase().includes(needle) ||
        p.name_ar.includes(needle) ||
        p.slug.toLowerCase().includes(needle)
      );
    });
  }, [products, query, cat]);

  const allVisible = rows.length > 0 && rows.every((p) => selected.has(p.slug));
  const someVisible = rows.some((p) => selected.has(p.slug));

  function toggleOne(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (rows.length > 0 && rows.every((p) => next.has(p.slug))) {
        for (const p of rows) next.delete(p.slug);
      } else {
        for (const p of rows) next.add(p.slug);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <MagnifyingGlass
            size={17}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("admin.table.searchProducts")}
            aria-label={t("admin.table.searchProductAria")}
            className="field w-full ps-10 pe-3.5 py-2.5"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label={t("admin.table.filterCategory")}
          className="field px-3.5 py-2.5 min-w-[190px]"
        >
          <option value="">{t("admin.table.allCategories")}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {lang === "ar" ? c.name_ar : c.name_fr}
            </option>
          ))}
        </select>
        <span className="text-[13px] text-ink-soft whitespace-nowrap">
          {rows.length} / {products.length}
        </span>
      </div>

      {/* Bulk bar */}
      {bulkSlugs.length > 0 && (
        <form
          action={bulkAction}
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            void askConfirm({
              title: t("admin.table.delProductsTitle"),
              message: t("admin.table.delProductsMsg").replace("{n}", String(bulkSlugs.length)),
              confirmLabel: t("admin.table.delete"),
              tone: "danger",
            }).then((ok) => {
              if (ok) form.requestSubmit();
            });
          }}
          className="card px-4 py-3 flex flex-wrap items-center gap-3 !border-primary"
        >
          {bulkSlugs.map((s) => (
            <input key={s} type="hidden" name="slugs" value={s} />
          ))}
          <span className="text-[13.5px] font-bold">
            {t("admin.table.selCount").replace("{n}", String(bulkSlugs.length))}
          </span>
          <button
            type="submit"
            disabled={bulkPending}
            className="btn !px-3 !py-2 text-[13px] border-2 border-line text-primary hover:border-primary ms-auto disabled:opacity-60"
          >
            <Trash size={15} weight="bold" />
            {t("admin.table.deleteSelected")}
          </button>
        </form>
      )}

      {/* Header (desktop) */}
      <div
        className={`hidden md:grid ${COLS} gap-4 border border-transparent px-3.5 pb-2 text-[11.5px] font-bold uppercase tracking-[0.07em] text-ink-soft`}
      >
        <input
          type="checkbox"
          checked={allVisible}
          ref={(el) => {
            if (el) el.indeterminate = someVisible && !allVisible;
          }}
          onChange={toggleAll}
          aria-label={t("admin.table.selectAll")}
          className="w-4.5 h-4.5 accent-primary self-center"
        />
        <span className="text-start">{t("admin.table.product")}</span>
        <span className="text-start">{t("admin.form.category")}</span>
        <span className="text-start">{t("admin.table.price")}</span>
        <span className="text-start">{t("admin.form.stock")}</span>
        <span className="text-end">{t("admin.table.actions")}</span>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-[14.5px] text-ink-soft">
          {t("admin.table.noProductMatch")}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((p) => {
            const low = p.stock > 0 && p.stock <= 5;
            const out = p.stock <= 0 || p.badge === "epuise";
            return (
              <li
                key={p.slug}
                className={`card p-3.5 md:grid ${COLS} md:items-center gap-4`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.slug)}
                  onChange={() => toggleOne(p.slug)}
                  aria-label={t("admin.table.selectItem").replace("{n}", pname(p))}
                  className="w-4.5 h-4.5 accent-primary shrink-0 md:self-center"
                />
                {/* Product */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="relative w-14 h-14 shrink-0 rounded-[10px] overflow-hidden border border-line bg-highlight/30">
                    <Image
                      src={p.image}
                      alt={pname(p)}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-[14.5px] leading-tight line-clamp-1">
                      {pname(p)}
                    </p>
                    <p className="text-[12px] text-ink-soft truncate">{p.slug}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="mt-2.5 md:mt-0 text-[13.5px] md:text-start">
                  <span className="md:hidden font-bold text-ink-soft me-1.5">{t("admin.table.categoryIs")}</span>
                  {catName(p.category)}
                </div>

                {/* Price */}
                <div className="mt-1.5 md:mt-0 md:flex md:items-baseline md:justify-start md:gap-1.5">
                  <span className="price text-[15px]">{formatPrice(p.price)}</span>
                  {p.old_price != null && (
                    <span className="ms-1.5 md:ms-0 text-[12.5px] line-through text-ink-soft">
                      {formatPrice(p.old_price)}
                    </span>
                  )}
                </div>

                {/* Stock */}
                <div className="mt-1.5 md:mt-0 flex items-start gap-2 md:justify-start">
                  <span
                    className={`text-[14px] font-bold ${
                      out ? "text-primary" : low ? "text-ink" : "text-teal-deep"
                    }`}
                  >
                    {p.stock}
                  </span>
                  {out && (
                    <span className="rounded-full bg-ink text-white text-[10.5px] font-bold px-2 py-0.5">
                      {t("admin.table.out")}
                    </span>
                  )}
                  {low && !out && (
                    <span className="rounded-full bg-highlight text-cream text-[10.5px] font-bold px-2 py-0.5">
                      {t("admin.table.low")}
                    </span>
                  )}
                  {p.badge && !out && BADGE_STYLE[p.badge] && (
                    <span
                      className={`rounded-full text-[10.5px] font-bold px-2 py-0.5 ${BADGE_STYLE[p.badge]}`}
                    >
                      {BADGE_LABEL[p.badge]}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-3 md:mt-0 flex items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => void copyLink(p.slug)}
                    aria-label={`${t("admin.table.copyLink")} ${pname(p)}`}
                    title={t("admin.table.copyLink")}
                    className="btn !px-3 !py-2 text-[13px] border-2 border-line text-ink hover:border-ink"
                  >
                    {copiedSlug === p.slug ? (
                      <Check size={15} weight="bold" className="text-teal-deep" />
                    ) : (
                      <LinkSimple size={15} weight="bold" />
                    )}
                  </button>
                  <Link
                    href={`/admin/produits/${p.slug}`}
                    className="btn btn-outline !px-3 !py-2 text-[13px]"
                    aria-label={`${t("admin.table.edit")} ${pname(p)}`}
                  >
                    <PencilSimple size={15} weight="bold" />
                    <span className="hidden sm:inline">{t("admin.table.edit")}</span>
                  </Link>
                  <form
                    action={deleteAction}
                    className="inline"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      void askConfirm({
                        title: t("admin.table.delProductTitle"),
                        message: `« ${pname(p)} » ${t("admin.table.delProductMsg")}`,
                        confirmLabel: t("admin.table.delete"),
                        tone: "danger",
                      }).then((ok) => {
                        if (ok) form.requestSubmit();
                      });
                    }}
                  >
                    <input type="hidden" name="slug" value={p.slug} />
                    <button
                      type="submit"
                      aria-label={`${t("admin.table.delete")} ${pname(p)}`}
                      className="btn !px-3 !py-2 text-[13px] border-2 border-line text-primary hover:border-primary"
                    >
                      <Trash size={15} weight="bold" />
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
