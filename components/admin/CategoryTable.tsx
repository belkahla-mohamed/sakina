"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { Backpack, BookOpen, Gift, MagnifyingGlass, PencilSimple, PuzzlePiece, Star, Trash, TShirt } from "@phosphor-icons/react";
import { deleteCategory, type ActionState } from "@/app/admin/actions";
import { useConfirm } from "@/components/admin/Toast";
import { useActionToast } from "@/components/admin/useActionToast";
import { useLang } from "@/components/providers";
import type { Category, Product } from "@/lib/types";

const ICONS: Record<string, typeof Gift> = {
  gift: Gift,
  puzzle: PuzzlePiece,
  book: BookOpen,
  backpack: Backpack,
  tshirt: TShirt,
};

const COLS = "md:grid-cols-[minmax(0,1.6fr)_1fr_0.7fr_0.7fr_auto]";

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
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(
    deleteCategory,
    {}
  );
  useActionToast(deleteState);
  const askConfirm = useConfirm();
  const { t, lang } = useLang();
  const cname = (c: Category) => (lang === "ar" ? c.name_ar : c.name_fr);

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

      <div
        className={`hidden md:grid ${COLS} gap-4 px-4 pb-2 text-[11.5px] font-bold uppercase tracking-[0.07em] text-ink-soft`}
      >
        <span>{t("admin.form.category")}</span>
        <span>{t("admin.table.cover")}</span>
        <span>{t("admin.nav.products")}</span>
        <span>{t("admin.table.text")}</span>
        <span className="text-end">{t("admin.table.actions")}</span>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-[14.5px] text-ink-soft">
          {t("admin.table.noCategoryMatch")}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((c) => {
            const Icon = ICONS[c.icon] ?? Gift;
            const n = counts[c.slug] ?? 0;
            const img = cover.get(c.slug)?.image;
            return (
              <li key={c.slug} className={`card p-3.5 md:grid ${COLS} md:items-center gap-4`}>
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
                <div className="mt-1.5 md:mt-0 text-[14px] font-bold">{n}</div>

                {/* Text mode */}
                <div className="mt-1.5 md:mt-0 text-[13px] text-ink-soft">
                  {c.text === "dark" ? t("admin.category.textDark") : t("admin.category.textLight")}
                </div>

                {/* Actions */}
                <div className="mt-3 md:mt-0 flex items-center gap-2 md:justify-end">
                  <Link
                    href={`/admin/categories/${c.slug}`}
                    className="btn btn-outline !px-3 !py-2 text-[13px]"
                    aria-label={`${t("admin.table.edit")} ${cname(c)}`}
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
                        title: t("admin.table.delCategoryTitle"),
                        message:
                          n > 0
                            ? t("admin.table.delCategoryMsg").replace("{name}", cname(c)).replace("{n}", String(n))
                            : t("admin.table.delCategoryMsgEmpty").replace("{name}", cname(c)),
                        confirmLabel: t("admin.table.delete"),
                        tone: "danger",
                      }).then((ok) => {
                        if (ok) form.requestSubmit();
                      });
                    }}
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
