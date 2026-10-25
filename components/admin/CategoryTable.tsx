"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Check, DeviceMobile, Handbag, Lamp, LinkSimple, MagnifyingGlass, PencilSimple, Pen, Sparkle, Star, Trash } from "@phosphor-icons/react";
import { deleteCategory, deleteCategories, type ActionState } from "@/app/admin/actions";
import { confirmSubmit, useConfirm, useToast } from "@/components/admin/Toast";
import { useActionToast } from "@/components/admin/useActionToast";
import { useLang } from "@/components/providers";
import type { Category, Product } from "@/lib/types";

const ICONS: Record<string, typeof Lamp> = {
  lamp: Lamp,
  handbag: Handbag,
  sparkle: Sparkle,
  device: DeviceMobile,
  pen: Pen,
};

const COLS = "md:grid-cols-[24px_minmax(0,1.7fr)_minmax(0,0.8fr)_minmax(0,0.55fr)_minmax(0,0.85fr)_230px]";

export function CategoryTable({
  categories,
  counts,
  products,
}: {
  categories: Category[];
  counts: Record<string, number>;
  products: Product[];
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(
    deleteCategory,
    {}
  );
  const [bulkState, bulkAction, bulkPending] = useActionState<ActionState, FormData>(
    deleteCategories,
    {}
  );
  useActionToast(deleteState);
  useActionToast(bulkState);
  const askConfirm = useConfirm();
  const toast = useToast();
  const { t, lang } = useLang();
  const cname = (c: Category) => (lang === "ar" ? c.name_ar : c.name_fr);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/shop?cat=${slug}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
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

  const allSlugs = useMemo(() => new Set(categories.map((c) => c.slug)), [categories]);
  const bulkSlugs = useMemo(
    () => [...selected].filter((s) => allSlugs.has(s)),
    [selected, allSlugs]
  );

  const cover = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products) if (!m.has(p.category)) m.set(p.category, p);
    return m;
  }, [products]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter(
      (c) =>
        c.name_fr.toLowerCase().includes(needle) ||
        c.name_ar.includes(needle) ||
        c.slug.toLowerCase().includes(needle)
    );
  }, [categories, query]);

  const allVisible = rows.length > 0 && rows.every((c) => selected.has(c.slug));
  const someVisible = rows.some((c) => selected.has(c.slug));

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
      if (rows.length > 0 && rows.every((c) => next.has(c.slug))) {
        for (const c of rows) next.delete(c.slug);
      } else {
        for (const c of rows) next.add(c.slug);
      }
      return next;
    });
  }

  return (
    <div className="space-y-4">
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
            placeholder={t("admin.table.searchCategory")}
            aria-label={t("admin.table.searchCategoryAria")}
            className="field w-full ps-10 pe-3.5 py-2.5"
          />
        </div>
        <span className="text-[13px] text-ink-soft whitespace-nowrap">
          {rows.length} / {categories.length}
        </span>
      </div>

      {/* Bulk bar */}
      {bulkSlugs.length > 0 && (
        <form
          action={bulkAction}
          onSubmit={(e) =>
            confirmSubmit(e, askConfirm, {
              title: t("admin.table.delCategoriesTitle"),
              message: t("admin.table.delCategoriesMsg").replace("{n}", String(bulkSlugs.length)),
              confirmLabel: t("admin.table.delete"),
              tone: "danger",
            })
          }
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
        <span className="text-start">{t("admin.form.category")}</span>
        <span className="text-start">{t("admin.table.cover")}</span>
        <span className="text-center">{t("admin.nav.products")}</span>
        <span className="text-start">{t("admin.table.text")}</span>
        <span className="text-end">{t("admin.table.actions")}</span>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-[14.5px] text-ink-soft">
          {t("admin.table.noCategoryMatch")}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((c) => {
            const Icon = ICONS[c.icon] ?? Lamp;
            const n = counts[c.slug] ?? 0;
            const img = cover.get(c.slug)?.image;
            return (
              <li key={c.slug} className={`card p-3.5 md:grid ${COLS} md:items-center gap-4`}>
                <input
                  type="checkbox"
                  checked={selected.has(c.slug)}
                  onChange={() => toggleOne(c.slug)}
                  aria-label={t("admin.table.selectItem").replace("{n}", cname(c))}
                  className="w-4.5 h-4.5 accent-primary shrink-0 md:self-center"
                />
                {/* Category */}
                <div className="flex items-center gap-3 min-w-0">
                  {c.image ? (
                    <span className="relative block w-11 h-11 shrink-0 rounded-[10px] overflow-hidden border border-ink/20 bg-white">
                      <Image src={c.image} alt={cname(c)} fill sizes="44px" className="object-cover" />
                    </span>
                  ) : (
                    <span
                      className={`w-11 h-11 shrink-0 rounded-[10px] flex items-center justify-center border border-ink/20 ${
                        c.text === "dark" ? "text-ink" : "text-white"
                      }`}
                      style={{ background: c.color }}
                    >
                      <Icon size={20} />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-display font-bold text-[14.5px] leading-tight flex items-center gap-1.5">
                      {cname(c)}
                      {c.featured && (
                        <Star size={13} weight="fill" className="text-highlight shrink-0" aria-label={t("admin.table.starred")} />
                      )}
                    </p>
                    <p className="text-[12px] text-ink-soft truncate">{c.slug}</p>
                  </div>
                </div>

                {/* Cover */}
                <div className="mt-2.5 md:mt-0">
                  {img ? (
                    <div className="relative w-16 h-12 rounded-[8px] overflow-hidden border border-line bg-highlight/30">
                      <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                    </div>
                  ) : (
                    <span className="text-[12.5px] text-ink-soft">—</span>
                  )}
                </div>

                {/* Count */}
                <div className="mt-1.5 md:mt-0 text-[14px] font-bold md:text-center">{n}</div>

                {/* Text mode */}
                <div className="mt-1.5 md:mt-0 text-[13px] text-ink-soft">
                  {c.text === "dark" ? t("admin.category.textDark") : t("admin.category.textLight")}
                </div>

                {/* Actions */}
                <div className="mt-3 md:mt-0 flex items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => void copyLink(c.slug)}
                    aria-label={`${t("admin.table.copyLink")} ${cname(c)}`}
                    title={t("admin.table.copyLink")}
                    className="btn !px-3 !py-2 text-[13px] border-2 border-line text-ink hover:border-ink"
                  >
                    {copiedSlug === c.slug ? (
                      <Check size={15} weight="bold" className="text-teal-deep" />
                    ) : (
                      <LinkSimple size={15} weight="bold" />
                    )}
                  </button>
                  <Link
                    href={`/admin/categories/${encodeURIComponent(c.slug)}`}
                    className="btn btn-outline !px-3 !py-2 text-[13px]"
                    aria-label={`${t("admin.table.edit")} ${cname(c)}`}
                  >
                    <PencilSimple size={15} weight="bold" />
                    <span className="hidden sm:inline">{t("admin.table.edit")}</span>
                  </Link>
                  <form
                    action={deleteAction}
                    className="inline"
                    onSubmit={(e) =>
                      confirmSubmit(e, askConfirm, {
                        title: t("admin.table.delCategoryTitle"),
                        message:
                          n > 0
                            ? t("admin.table.delCategoryMsg").replace("{name}", cname(c)).replace("{n}", String(n))
                            : t("admin.table.delCategoryMsgEmpty").replace("{name}", cname(c)),
                        confirmLabel: t("admin.table.delete"),
                        tone: "danger",
                      })
                    }
                  >
                    <input type="hidden" name="slug" value={c.slug} />
                    <button
                      type="submit"
                      aria-label={`${t("admin.table.delete")} ${cname(c)}`}
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
