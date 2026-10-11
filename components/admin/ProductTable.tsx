"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { MagnifyingGlass, PencilSimple, Trash } from "@phosphor-icons/react";
import { deleteProduct, type ActionState } from "@/app/admin/actions";
import { useConfirm } from "@/components/admin/Toast";
import { useActionToast } from "@/components/admin/useActionToast";
import type { Category, Product } from "@/lib/types";

const BADGE_STYLE: Record<string, string> = {
  promo: "bg-primary text-white",
  nouveau: "bg-highlight text-ink",
  epuise: "bg-ink text-white",
};

const BADGE_LABEL: Record<string, string> = {
  promo: "Promo",
  nouveau: "Nouveau",
  epuise: "Épuisé",
};

function formatPrice(n: number): string {
  return `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ")} dh`;
}

const COLS = "md:grid-cols-[minmax(0,2.4fr)_1.1fr_0.9fr_0.7fr_auto]";

export function ProductTable({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("");
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(
    deleteProduct,
    {}
  );
  useActionToast(deleteState);
  const askConfirm = useConfirm();

  const catName = useMemo(() => {
    const m = new Map(categories.map((c) => [c.slug, c.name_fr]));
    return (slug: string) => m.get(slug) ?? slug;
  }, [categories]);

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
            placeholder="Rechercher par nom ou slug…"
            aria-label="Rechercher un produit"
            className="field w-full ps-10 pe-3.5 py-2.5"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Filtrer par catégorie"
          className="field px-3.5 py-2.5 min-w-[190px]"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name_fr}
            </option>
          ))}
        </select>
        <span className="text-[13px] text-ink-soft whitespace-nowrap">
          {rows.length} / {products.length}
        </span>
      </div>

      {/* Header (desktop) */}
      <div
        className={`hidden md:grid ${COLS} gap-4 px-4 pb-2 text-[11.5px] font-bold uppercase tracking-[0.07em] text-ink-soft`}
      >
        <span>Produit</span>
        <span>Catégorie</span>
        <span>Prix</span>
        <span>Stock</span>
        <span className="text-end">Actions</span>
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-[14.5px] text-ink-soft">
          Aucun produit ne correspond.
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
                {/* Product */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-14 h-14 shrink-0 rounded-[10px] overflow-hidden border border-line bg-highlight/30">
                    <Image
                      src={p.image}
                      alt={p.name_fr}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-[14.5px] leading-tight line-clamp-1">
                      {p.name_fr}
                    </p>
                    <p className="text-[12px] text-ink-soft truncate">{p.slug}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="mt-2.5 md:mt-0 text-[13.5px]">
                  <span className="md:hidden font-bold text-ink-soft me-1.5">Catégorie :</span>
                  {catName(p.category)}
                </div>

                {/* Price */}
                <div className="mt-1.5 md:mt-0">
                  <span className="price text-[15px]">{formatPrice(p.price)}</span>
                  {p.old_price != null && (
                    <span className="ms-1.5 text-[12.5px] line-through text-ink-soft">
                      {formatPrice(p.old_price)}
                    </span>
                  )}
                </div>

                {/* Stock */}
                <div className="mt-1.5 md:mt-0 flex items-center gap-2">
                  <span
                    className={`text-[14px] font-bold ${
                      out ? "text-primary" : low ? "text-ink" : "text-teal-deep"
                    }`}
                  >
                    {p.stock}
                  </span>
                  {out && (
                    <span className="rounded-full bg-ink text-white text-[10.5px] font-bold px-2 py-0.5">
                      Épuisé
                    </span>
                  )}
                  {low && !out && (
                    <span className="rounded-full bg-highlight text-ink text-[10.5px] font-bold px-2 py-0.5">
                      Bas
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
                  <Link
                    href={`/admin/produits/${p.slug}`}
                    className="btn btn-outline !px-3 !py-2 text-[13px]"
                    aria-label={`Modifier ${p.name_fr}`}
                  >
                    <PencilSimple size={15} weight="bold" />
                    <span className="hidden sm:inline">Modifier</span>
                  </Link>
                  <form
                    action={deleteAction}
                    className="inline"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      void askConfirm({
                        title: "Supprimer ce produit ?",
                        message: `« ${p.name_fr} » disparaîtra de la boutique. Cette action est définitive.`,
                        confirmLabel: "Supprimer",
                        tone: "danger",
                      }).then((ok) => {
                        if (ok) form.requestSubmit();
                      });
                    }}
                  >
                    <input type="hidden" name="slug" value={p.slug} />
                    <button
                      type="submit"
                      aria-label={`Supprimer ${p.name_fr}`}
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
