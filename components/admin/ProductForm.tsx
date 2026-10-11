"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveProduct, type ActionState } from "@/app/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import { useActionToast } from "@/components/admin/useActionToast";
import type { Category, Product } from "@/lib/types";

const BADGES = [
  { value: "", label: "Aucun" },
  { value: "nouveau", label: "Nouveau" },
  { value: "promo", label: "Promo" },
  { value: "epuise", label: "Épuisé" },
];

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveProduct,
    {}
  );
  useActionToast(state);
  const isEdit = Boolean(product);

  const label = "block text-[13.5px] font-bold mb-1.5";
  const field = "field w-full px-3.5 py-2.5";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {isEdit && <input type="hidden" name="existing_slug" value={product!.slug} />}

      {/* Identity */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">Identité</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name_fr" className={label}>
              Nom (FR) <span className="text-primary">*</span>
            </label>
            <input id="name_fr" name="name_fr" defaultValue={product?.name_fr} required className={field} />
          </div>
          <div>
            <label htmlFor="name_ar" className={label}>
              Nom (AR) <span className="text-primary">*</span>
            </label>
            <input id="name_ar" name="name_ar" dir="rtl" defaultValue={product?.name_ar} required className={`${field} ar`} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="slug" className={label}>
              Slug {isEdit ? "(inchangé)" : "(vide = généré)"}
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              // `readOnly` (not `disabled`): a disabled control is dropped from
              // FormData, which silently loses the slug on every edit.
              readOnly={isEdit}
              placeholder="puzzle-en-bois"
              aria-readonly={isEdit}
              className={`${field} read-only:opacity-60 read-only:cursor-default`}
            />
          </div>
          <div>
            <label htmlFor="category" className={label}>
              Catégorie <span className="text-primary">*</span>
            </label>
            <select
              id="category"
              name="category"
              defaultValue={product?.category ?? ""}
              required
              className={field}
            >
              <option value="" disabled>
                Choisir…
              </option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name_fr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Pricing & stock */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">Prix & stock</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className={label}>
              Prix (DH) <span className="text-primary">*</span>
            </label>
            <input id="price" name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ""} required className={field} />
          </div>
          <div>
            <label htmlFor="old_price" className={label}>
              Ancien prix (promo)
            </label>
            <input id="old_price" name="old_price" type="number" min="0" step="0.01" defaultValue={product?.old_price ?? ""} className={field} />
          </div>
          <div>
            <label htmlFor="stock" className={label}>
              Stock
            </label>
            <input id="stock" name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} className={field} />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="badge" className={label}>
              Badge
            </label>
            <select id="badge" name="badge" defaultValue={product?.badge ?? ""} className={field}>
              {BADGES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rating" className={label}>
              Note (0–5)
            </label>
            <input id="rating" name="rating" type="number" min="0" max="5" step="0.1" defaultValue={product?.rating ?? 5} className={field} />
          </div>
          <div>
            <label htmlFor="reviews" className={label}>
              Nb. avis
            </label>
            <input id="reviews" name="reviews" type="number" min="0" defaultValue={product?.reviews ?? 0} className={field} />
          </div>
        </div>
        <div className="flex flex-wrap gap-5 pt-1">
          <label className="flex items-center gap-2 text-[14.5px] font-bold">
            <input type="checkbox" name="is_new" defaultChecked={product?.is_new} className="w-4.5 h-4.5 accent-primary" />
            Nouveauté
          </label>
          <label className="flex items-center gap-2 text-[14.5px] font-bold">
            <input type="checkbox" name="is_bestseller" defaultChecked={product?.is_bestseller} className="w-4.5 h-4.5 accent-primary" />
            Meilleure vente
          </label>
        </div>
      </section>

      {/* Descriptions */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">Descriptions</h2>
        <div>
          <label htmlFor="desc_fr" className={label}>
            Description (FR)
          </label>
          <textarea id="desc_fr" name="desc_fr" rows={3} defaultValue={product?.desc_fr} className={`${field} resize-y`} />
        </div>
        <div>
          <label htmlFor="desc_ar" className={label}>
            Description (AR)
          </label>
          <textarea id="desc_ar" name="desc_ar" dir="rtl" rows={3} defaultValue={product?.desc_ar} className={`${field} ar resize-y`} />
        </div>
        <div>
          <ImageField value={product?.image ?? ""} />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le produit"}
        </button>
        <Link href="/admin/produits" className="btn btn-outline">
          Annuler
        </Link>
      </div>
    </form>
  );
}
