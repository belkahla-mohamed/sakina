"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveProduct, type ActionState } from "@/app/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import { useActionToast } from "@/components/admin/useActionToast";
import { useLang } from "@/components/providers";
import type { Category, Product } from "@/lib/types";

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
  const { t, lang } = useLang();
  const isEdit = Boolean(product);

  const BADGES = [
    { value: "", label: t("admin.form.badgeNone") },
    { value: "nouveau", label: t("admin.form.badgeNew") },
    { value: "promo", label: t("admin.form.badgePromo") },
    { value: "epuise", label: t("admin.form.badgeOut") },
  ];

  const label = "block text-[13.5px] font-bold mb-1.5";
  const field = "field w-full px-3.5 py-2.5";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {isEdit && <input type="hidden" name="existing_slug" value={product!.slug} />}

      {/* Identity */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">{t("admin.form.identity")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name_fr" className={label}>
              {t("admin.form.nameFr")} <span className="text-primary">*</span>
            </label>
            <input id="name_fr" name="name_fr" defaultValue={product?.name_fr} required className={field} />
          </div>
          <div>
            <label htmlFor="name_ar" className={label}>
              {t("admin.form.nameAr")} <span className="text-primary">*</span>
            </label>
            <input id="name_ar" name="name_ar" dir="rtl" defaultValue={product?.name_ar} required className={`${field} ar`} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="slug" className={label}>
              Slug {isEdit ? t("admin.form.slugUnchanged") : t("admin.form.slugGenerated")}
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
              {t("admin.form.category")} <span className="text-primary">*</span>
            </label>
            <select
              id="category"
              name="category"
              defaultValue={product?.category ?? ""}
              required
              className={field}
            >
              <option value="" disabled>
                {t("admin.form.choose")}
              </option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {lang === "ar" ? c.name_ar : c.name_fr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Pricing & stock */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">{t("admin.product.pricing")}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className={label}>
              {t("admin.form.price")} <span className="text-primary">*</span>
            </label>
            <input id="price" name="price" type="number" min="0" step="0.01" defaultValue={product?.price ?? ""} required className={field} />
          </div>
          <div>
            <label htmlFor="old_price" className={label}>
              {t("admin.form.oldPrice")}
            </label>
            <input id="old_price" name="old_price" type="number" min="0" step="0.01" defaultValue={product?.old_price ?? ""} className={field} />
          </div>
          <div>
            <label htmlFor="stock" className={label}>
              {t("admin.form.stock")}
            </label>
            <input id="stock" name="stock" type="number" min="0" defaultValue={product?.stock ?? 0} className={field} />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="badge" className={label}>
              {t("admin.form.badge")}
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
              {t("admin.form.rating")}
            </label>
            <input id="rating" name="rating" type="number" min="0" max="5" step="0.1" defaultValue={product?.rating ?? 5} className={field} />
          </div>
          <div>
            <label htmlFor="reviews" className={label}>
              {t("admin.form.reviews")}
            </label>
            <input id="reviews" name="reviews" type="number" min="0" defaultValue={product?.reviews ?? 0} className={field} />
          </div>
        </div>
        <div className="flex flex-wrap gap-5 pt-1">
          <label className="flex items-center gap-2 text-[14.5px] font-bold">
            <input type="checkbox" name="is_new" defaultChecked={product?.is_new} className="w-4.5 h-4.5 accent-primary" />
            {t("admin.form.isNew")}
          </label>
          <label className="flex items-center gap-2 text-[14.5px] font-bold">
            <input type="checkbox" name="is_bestseller" defaultChecked={product?.is_bestseller} className="w-4.5 h-4.5 accent-primary" />
            {t("admin.form.bestseller")}
          </label>
        </div>
      </section>

      {/* Descriptions */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">{t("admin.form.descriptions")}</h2>
        <div>
          <label htmlFor="desc_fr" className={label}>
            {t("admin.form.descFr")}
          </label>
          <textarea id="desc_fr" name="desc_fr" rows={3} defaultValue={product?.desc_fr} className={`${field} resize-y`} />
        </div>
        <div>
          <label htmlFor="desc_ar" className={label}>
            {t("admin.form.descAr")}
          </label>
          <textarea id="desc_ar" name="desc_ar" dir="rtl" rows={3} defaultValue={product?.desc_ar} className={`${field} ar resize-y`} />
        </div>
        <div>
          <ImageField value={product?.image ?? ""} />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? t("admin.form.pending") : isEdit ? t("admin.form.save") : t("admin.form.createProduct")}
        </button>
        <Link href="/admin/produits" className="btn btn-outline">
          {t("admin.form.cancel")}
        </Link>
      </div>
    </form>
  );
}
