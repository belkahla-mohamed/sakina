"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Plus,
  Tag,
  Trash,
} from "@phosphor-icons/react";
import { saveOffers, type ActionState } from "@/app/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import { useConfirm } from "@/components/admin/Toast";
import { useActionToast } from "@/components/admin/useActionToast";
import { useLang } from "@/components/providers";
import type { Category, Offer, Product } from "@/lib/types";
import type { TKey } from "@/lib/i18n";
import { emptyOffer, MAX_OFFERS } from "@/lib/offers";

const label = "block text-[13.5px] font-bold mb-1.5";
const field = "field w-full px-3.5 py-2.5";

const BRAND_SWATCHES: { hex: string; key: TKey }[] = [
  { hex: "#76220a", key: "admin.offers.colorBrick" },
  { hex: "#5c1a07", key: "admin.offers.colorBrickDeep" },
  { hex: "#2a1d16", key: "admin.offers.colorInk" },
  { hex: "#f4f0e6", key: "admin.offers.colorSand" },
  { hex: "#fcfbf6", key: "admin.offers.colorCream" },
];

function ColorSwatches({
  value,
  onPick,
}: {
  value: string;
  onPick: (hex: string) => void;
}) {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-1.5 mt-2">
      {BRAND_SWATCHES.map((c) => (
        <button
          key={c.hex}
          type="button"
          title={t(c.key)}
          aria-label={t(c.key)}
          aria-pressed={value.toLowerCase() === c.hex}
          onClick={() => onPick(c.hex)}
          className={`w-6 h-6 rounded-full border-2 transition-all ${
            value.toLowerCase() === c.hex ? "border-ink scale-110" : "border-line hover:border-ink/50"
          }`}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}

function FontSelect({
  value,
  onChange,
  title,
}: {
  value: string;
  onChange: (v: string) => void;
  title: string;
}) {
  const { t } = useLang();
  return (
    <div>
      <span className={label}>{title}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={field}
      >
        <option value="">{t("admin.offers.fontDefault")}</option>
        <option value="display">{t("admin.offers.fontDisplay")}</option>
        <option value="body">{t("admin.offers.fontBody")}</option>
      </select>
    </div>
  );
}

function PlacementSelect({
  value,
  onChange,
  title,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  title: string;
  options: { value: string; key: TKey }[];
}) {
  const { t } = useLang();
  return (
    <div>
      <span className={label}>{title}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={field}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {t(o.key)}
          </option>
        ))}
      </select>
    </div>
  );
}

function OfferPreview({ offer, lang }: { offer: Offer; lang: string }) {
  const { t } = useLang();
  const title = lang === "ar" ? offer.title_ar : offer.title_fr;
  const text = lang === "ar" ? offer.text_ar : offer.text_fr;
  const btn = lang === "ar" ? offer.btn_label_ar : offer.btn_label_fr;

  const titleFont =
    offer.title_font === "display"
      ? "var(--font-display)"
      : offer.title_font === "body"
        ? "var(--font-body)"
        : lang === "ar"
          ? "var(--font-arabic)"
          : "var(--font-display)";
  const textFont =
    offer.text_font === "display"
      ? "var(--font-display)"
      : offer.text_font === "body"
        ? "var(--font-body)"
        : lang === "ar"
          ? "var(--font-arabic)"
          : "var(--font-body)";

  const bgStyles: React.CSSProperties = {};
  if (offer.bg_color) {
    bgStyles.backgroundColor = offer.bg_color;
    if (offer.bg_opacity) bgStyles.opacity = offer.bg_opacity / 100;
  }
  if (offer.bg_shadow) {
    const a = offer.bg_shadow_opacity / 100;
    const [r, g, b] = [offer.bg_shadow.slice(1, 3), offer.bg_shadow.slice(3, 5), offer.bg_shadow.slice(5, 7)].map((h) => parseInt(h, 16));
    bgStyles.boxShadow = `0 12px 32px rgba(${r},${g},${b},${a * 0.55})`;
  }

  const badge =
    offer.discount_type === "percent"
      ? `-${offer.discount_value}%`
      : `-${offer.discount_value} DH`;

  return (
    <div
      className="relative shrink-0 rounded-[14px] border border-line overflow-hidden min-h-[240px] w-full max-w-[420px] bg-white"
      style={bgStyles}
    >
      <div className="relative h-[150px] w-full bg-sand/40 flex items-center justify-center">
        {offer.image ? (
          <Image
            src={offer.image}
            alt=""
            fill
            sizes="420px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink/25 text-[11px] font-bold">
            {t("admin.offers.image")}
          </div>
        )}
        {offer.image && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-transparent" />
        )}
        {offer.discount_value > 0 && (
          <div className="absolute top-3 start-3 rounded-[8px] bg-white/90 px-2 py-1 text-[11px] font-bold text-ink">
            {badge}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start gap-2 mb-1">
          {offer.show_title && title && (
            <h3
              className="font-bold line-clamp-1 leading-snug text-[16px]"
              style={{
                fontFamily: titleFont,
                fontWeight: offer.title_bold ? 700 : 400,
                textDecoration: offer.title_underline ? "underline" : "none",
                fontSize: offer.title_size ? `${offer.title_size}px` : undefined,
                color: offer.title_color || undefined,
              }}
            >
              {title}
            </h3>
          )}
        </div>
        {offer.show_text && text && (
          <p
            className="text-[13px] text-ink-soft line-clamp-2 leading-relaxed"
            style={{
              fontFamily: textFont,
              fontSize: offer.text_size ? `${offer.text_size}px` : undefined,
              color: offer.text_color || undefined,
            }}
          >
            {text}
          </p>
        )}
        {offer.show_btns && btn && (
          <a
            href={offer.btn_href || "/shop"}
            className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12.5px] font-bold text-white"
            style={{
              backgroundColor: offer.btn1_bg || undefined,
              color: offer.btn1_color || undefined,
            }}
          >
            {btn}
          </a>
        )}
      </div>
    </div>
  );
}

export function OffersEditor({
  initial,
  categories = [],
  products = [],
}: {
  initial: Offer[];
  categories: Category[];
  products: Product[];
}) {
  const { t, lang } = useLang();
  const [offers, setOffers] = useState<Offer[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveOffers,
    {}
  );
  useActionToast(state);
  const askConfirm = useConfirm();

  const selected = offers.find((o) => o.id === selectedId) ?? null;

  function patch(changes: Partial<Offer>) {
    if (!selectedId) return;
    setOffers((prev) =>
      prev.map((o) => (o.id === selectedId ? { ...o, ...changes } : o))
    );
  }

  function addOffer() {
    const offer = emptyOffer();
    setOffers((prev) =>
      prev.length >= MAX_OFFERS ? prev : [...prev, offer]
    );
    setSelectedId(offer.id);
  }

  function removeOffer(id: string) {
    void askConfirm({
      title: t("admin.offers.delete"),
      message: t("admin.offers.deleteConfirm"),
      confirmLabel: t("admin.offers.delete"),
      tone: "danger",
    }).then((ok) => {
      if (!ok) return;
      setOffers((prev) => prev.filter((o) => o.id !== id));
      if (selectedId === id) setSelectedId(null);
    });
  }

  function move(id: string, dir: -1 | 1) {
    setOffers((prev) => {
      const i = prev.findIndex((o) => o.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {/* The whole offer list travels as JSON — one save for everything. */}
      <input type="hidden" name="offers" value={JSON.stringify(offers)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addOffer}
          disabled={offers.length >= MAX_OFFERS}
          className="btn btn-outline disabled:opacity-50"
        >
          <Plus size={15} weight="bold" />
          {t("admin.offers.new")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? t("admin.form.pending") : t("admin.form.save")}
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[15px] text-ink-soft">{t("admin.offers.empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Offer list */}
          <ul className="space-y-2">
            {offers.map((o, i) => (
              <li key={o.id}>
                <div
                  className={`flex items-center gap-2 rounded-[12px] border-2 px-2.5 py-2 transition-colors ${
                    selectedId === o.id
                      ? "border-primary bg-primary/5"
                      : "border-line bg-white hover:border-ink/25"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(o.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-start"
                  >
                    <span className="relative w-16 h-11 shrink-0 rounded-[8px] overflow-hidden bg-milk border border-line block">
                      {o.image && (
                        <Image
                          src={o.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold text-[14px] truncate">
                        {lang === "ar" ? o.title_ar || o.title_fr : o.title_fr || o.title_ar || `#${i + 1}`}
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-ink-soft">
                        {o.starts_at || o.ends_at ? (
                          <>
                            <Clock size={13} weight="bold" />
                            {`${o.starts_at || "—"} → ${o.ends_at || "—"}`}
                          </>
                        ) : (
                          <>
                            <Tag size={13} weight="bold" />
                            {o.discount_type === "percent"
                              ? `-${o.discount_value}%`
                              : `-${o.discount_value} DH`}
                          </>
                        )}
                        <span className={`ml-2 text-[11px] font-bold rounded-full px-2 py-0.5 ${
                          o.active ? "bg-emerald/10 text-emerald" : "bg-line text-ink-soft"
                        }`}>
                          {o.active ? t("admin.offers.active") : t("admin.offers.inactive")}
                        </span>
                      </span>
                    </span>
                  </button>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      aria-label={t("admin.offers.moveUp")}
                      onClick={() => move(o.id, -1)}
                      disabled={i === 0}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] text-ink-soft hover:bg-milk disabled:opacity-30"
                    >
                      <ArrowUp size={15} weight="bold" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("admin.offers.moveDown")}
                      onClick={() => move(o.id, 1)}
                      disabled={i === offers.length - 1}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] text-ink-soft hover:bg-milk disabled:opacity-30"
                    >
                      <ArrowDown size={15} weight="bold" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("admin.offers.delete")}
                      onClick={() => removeOffer(o.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] text-primary hover:bg-primary/10"
                    >
                      <Trash size={15} weight="bold" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Editor + live preview */}
          {selected && (
            <div className="grid lg:grid-cols-2 gap-5 items-start">
              <section className="card p-5 space-y-4">
                <h2 className="font-display text-[17px] font-bold">
                  {t("admin.offers.editing")}
                </h2>

                <div className="flex items-center justify-between gap-3 rounded-[10px] bg-milk px-3.5 py-2.5">
                  <span className="text-[13.5px] font-bold">
                    {t("admin.offers.active")}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={selected.active}
                    onClick={() => patch({ active: !selected.active })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      selected.active ? "bg-primary" : "bg-line"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        selected.active ? "start-[22px]" : "start-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-[10px] bg-milk px-3.5 py-2.5">
                  <span className="text-[13.5px] font-bold">
                    {t("admin.offers.onHome")}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={selected.show_on_home}
                    aria-label={t("admin.offers.onHome")}
                    onClick={() => patch({ show_on_home: !selected.show_on_home })}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      selected.show_on_home ? "bg-primary" : "bg-line"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        selected.show_on_home ? "start-[22px]" : "start-0.5"
                      }`}
                    />
                  </button>
                </div>

                <ImageField
                  key={`img-${selected.id}`}
                  kind="hero"
                  value={selected.image}
                  label={t("admin.offers.image")}
                  onUrlChange={(url) => patch({ image: url })}
                />
                <p className="text-[12px] text-ink-soft -mt-2">
                  {t("admin.offers.imageHint")}
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={label} htmlFor={`t-fr-${selected.id}`}>
                      {t("admin.offers.titleFr")}
                    </label>
                    <input
                      id={`t-fr-${selected.id}`}
                      value={selected.title_fr}
                      maxLength={120}
                      onChange={(e) => patch({ title_fr: e.target.value })}
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor={`t-ar-${selected.id}`}>
                      {t("admin.offers.titleAr")}
                    </label>
                    <input
                      id={`t-ar-${selected.id}`}
                      dir="rtl"
                      value={selected.title_ar}
                      maxLength={120}
                      onChange={(e) => patch({ title_ar: e.target.value })}
                      className={`${field} ar`}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={label} htmlFor={`x-fr-${selected.id}`}>
                      {t("admin.offers.textFr")}
                    </label>
                    <textarea
                      id={`x-fr-${selected.id}`}
                      value={selected.text_fr}
                      maxLength={280}
                      rows={2}
                      onChange={(e) => patch({ text_fr: e.target.value })}
                      className={`${field} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={label} htmlFor={`x-ar-${selected.id}`}>
                      {t("admin.offers.textAr")}
                    </label>
                    <textarea
                      id={`x-ar-${selected.id}`}
                      dir="rtl"
                      value={selected.text_ar}
                      maxLength={280}
                      rows={2}
                      onChange={(e) => patch({ text_ar: e.target.value })}
                      className={`${field} ar resize-none`}
                    />
                  </div>
                </div>

                {/* Discount */}
                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.offers.discount")}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={label}>{t("admin.offers.discountType")}</label>
                      <select
                        value={selected.discount_type}
                        onChange={(e) => patch({ discount_type: e.target.value as "percent" | "fixed" })}
                        className={field}
                      >
                        <option value="percent">{t("admin.offers.discountPercent")}</option>
                        <option value="fixed">{t("admin.offers.discountFixed")}</option>
                      </select>
                    </div>
                    <div>
                      <label className={label}>{t("admin.offers.discountValue")}</label>
                      <input
                        type="number"
                        min="0"
                        value={selected.discount_value}
                        onChange={(e) => patch({ discount_value: Number(e.target.value) || 0 })}
                        className={field}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={label} htmlFor={`s-${selected.id}`}>
                        {t("admin.offers.startsAt")}
                      </label>
                      <input
                        id={`s-${selected.id}`}
                        type="date"
                        value={selected.starts_at}
                        onChange={(e) => patch({ starts_at: e.target.value })}
                        className={field}
                      />
                    </div>
                    <div>
                      <label className={label} htmlFor={`e-${selected.id}`}>
                        {t("admin.offers.endsAt")}
                      </label>
                      <input
                        id={`e-${selected.id}`}
                        type="date"
                        value={selected.ends_at}
                        onChange={(e) => patch({ ends_at: e.target.value })}
                        className={field}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Button */}
                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.offers.btn")}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={label} htmlFor={`b-fr-${selected.id}`}>
                        {t("admin.offers.btnLabel")} (FR)
                      </label>
                      <input
                        id={`b-fr-${selected.id}`}
                        value={selected.btn_label_fr}
                        maxLength={40}
                        onChange={(e) => patch({ btn_label_fr: e.target.value })}
                        className={field}
                      />
                    </div>
                    <div>
                      <label className={label} htmlFor={`b-ar-${selected.id}`}>
                        {t("admin.offers.btnLabel")} (AR)
                      </label>
                      <input
                        id={`b-ar-${selected.id}`}
                        dir="rtl"
                        value={selected.btn_label_ar}
                        maxLength={40}
                        onChange={(e) => patch({ btn_label_ar: e.target.value })}
                        className={`${field} ar`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={label} htmlFor={`b-href-${selected.id}`}>
                      {t("admin.offers.btnHref")}
                    </label>
                    <input
                      id={`b-href-${selected.id}`}
                      dir="ltr"
                      value={selected.btn_href}
                      maxLength={500}
                      placeholder="/shop"
                      onChange={(e) => patch({ btn_href: e.target.value })}
                      className={`${field} font-mono`}
                    />
                    <p className="text-[12px] text-ink-soft mt-1.5">
                      {t("admin.offers.btnHrefHint")}
                    </p>
                  </div>
                </fieldset>

                {/* Targeting */}
                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.offers.target")}
                  </legend>
                  <p className="text-[12.5px] text-ink-soft">{t("admin.offers.targetHint")}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: "all", key: "admin.offers.targetAll", desc: "admin.offers.targetAllDesc" },
                      { value: "category", key: "admin.offers.targetCategory", desc: "admin.offers.targetCategoryDesc" },
                      { value: "products", key: "admin.offers.targetProducts", desc: "admin.offers.targetProductsDesc" },
                    ].map((mode) => (
                      <label
                        key={mode.value}
                        className="cursor-pointer flex flex-col items-center gap-1.5 p-2.5 rounded-[8px] border border-line transition-all hover:border-primary/50"
                      >
                        <input
                          type="radio"
                          name="target_type"
                          value={mode.value}
                          checked={selected.target_type === mode.value}
                          onChange={() =>
                            patch({
                              target_type: mode.value as Offer["target_type"],
                              ...(mode.value !== "category" ? { target_category: "" } : {}),
                              ...(mode.value !== "products" ? { target_products: [] } : {}),
                            })
                          }
                          className="w-4 h-4 accent-primary shrink-0"
                        />
                        <span className="text-[12px] font-bold leading-tight">{t(mode.key as TKey)}</span>
                        <span className="text-[11px] text-ink-soft">{t(mode.desc as TKey)}</span>
                      </label>
                    ))}
                  </div>

                  {selected.target_type === "category" && (
                    <div>
                      <label className={label} htmlFor={`target-cat-${selected.id}`}>
                        {t("admin.offers.pickCategory")}
                      </label>
                      <select
                        id={`target-cat-${selected.id}`}
                        value={selected.target_category}
                        onChange={(e) => patch({ target_category: e.target.value })}
                        className={field}
                      >
                        <option value="">{t("admin.offers.targetCategory")}</option>
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {lang === "ar" ? c.name_ar : c.name_fr}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selected.target_type === "products" && (
                    <div>
                      <label className={label} htmlFor={`target-prods-${selected.id}`}>
                        {t("admin.offers.pickProducts")}
                      </label>
                      <select
                        id={`target-prods-${selected.id}`}
                        multiple
                        size={Math.min(8, Math.max(products.length, 1) + 1)}
                        value={selected.target_products}
                        onChange={(e) =>
                          patch({
                            target_products: Array.from(e.target.selectedOptions, (o) => o.value),
                          })
                        }
                        className={field}
                      >
                        {products.map((p) => (
                          <option key={p.slug} value={p.slug}>
                            {lang === "ar" ? p.name_ar : p.name_fr}
                          </option>
                        ))}
                      </select>
                      <p className="text-[12px] text-ink-soft mt-1.5">
                        {t("admin.offers.pickProductsHint")}
                      </p>
                    </div>
                  )}
                </fieldset>

                {/* Visibility */}
                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.offers.visibility")}
                  </legend>
                  <p className="text-[12.5px] text-ink-soft">{t("admin.offers.visibilityHint")}</p>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.show_title}
                        onChange={() => patch({ show_title: !selected.show_title })}
                        className="w-4.5 h-4.5 accent-primary"
                      />
                      {t("admin.offers.showTitle")}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.show_text}
                        onChange={() => patch({ show_text: !selected.show_text })}
                        className="w-4.5 h-4.5 accent-primary"
                      />
                      {t("admin.offers.showText")}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.show_btns}
                        onChange={() => patch({ show_btns: !selected.show_btns })}
                        className="w-4.5 h-4.5 accent-primary"
                      />
                      {t("admin.offers.showBtns")}
                    </label>
                  </div>
                </fieldset>

                {/* Typography */}
                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.offers.typography")}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <FontSelect
                      value={selected.title_font}
                      onChange={(v) => patch({ title_font: v })}
                      title={t("admin.offers.titleFont")}
                    />
                    <FontSelect
                      value={selected.text_font}
                      onChange={(v) => patch({ text_font: v })}
                      title={t("admin.offers.textFont")}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={label}>{t("admin.offers.titleSize")}</label>
                      <input
                        type="number"
                        min="0"
                        value={selected.title_size}
                        onChange={(e) => patch({ title_size: Number(e.target.value) || 0 })}
                        className={field}
                      />
                      <p className="text-[12px] text-ink-soft mt-1">{t("admin.offers.sizeDefault")}</p>
                    </div>
                    <div>
                      <label className={label}>{t("admin.offers.textSize")}</label>
                      <input
                        type="number"
                        min="0"
                        value={selected.text_size}
                        onChange={(e) => patch({ text_size: Number(e.target.value) || 0 })}
                        className={field}
                      />
                      <p className="text-[12px] text-ink-soft mt-1">{t("admin.offers.sizeDefault")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.title_bold}
                        onChange={() => patch({ title_bold: !selected.title_bold })}
                        className="w-4.5 h-4.5 accent-primary"
                      />
                      {t("admin.offers.titleBold")}
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer ml-6">
                      <input
                        type="checkbox"
                        checked={selected.title_underline}
                        onChange={() => patch({ title_underline: !selected.title_underline })}
                        className="w-4.5 h-4.5 accent-primary"
                      />
                      {t("admin.offers.titleUnderline")}
                    </label>
                  </div>
                </fieldset>

                {/* Colors */}
                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.offers.colors")}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <span className={label}>{t("admin.offers.titleColor")}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label={t("admin.offers.titleColor")}
                          value={selected.title_color || "#ffffff"}
                          onChange={(e) => patch({ title_color: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ title_color: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.offers.colorWhite")}
                        </button>
                      </div>
                      <ColorSwatches
                        value={selected.title_color || "#ffffff"}
                        onPick={(hex) => patch({ title_color: hex })}
                      />
                    </div>
                    <div>
                      <span className={label}>{t("admin.offers.textColor")}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label={t("admin.offers.textColor")}
                          value={selected.text_color || "#ffffff"}
                          onChange={(e) => patch({ text_color: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ text_color: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.offers.colorWhite")}
                        </button>
                      </div>
                      <ColorSwatches
                        value={selected.text_color || "#ffffff"}
                        onPick={(hex) => patch({ text_color: hex })}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <span className={label}>{t("admin.offers.btn1Bg")}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label={t("admin.offers.btn1Bg")}
                          value={selected.btn1_bg || "#ffffff"}
                          onChange={(e) => patch({ btn1_bg: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ btn1_bg: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.offers.colorDefault")}
                        </button>
                      </div>
                      <ColorSwatches
                        value={selected.btn1_bg || "#ffffff"}
                        onPick={(hex) => patch({ btn1_bg: hex })}
                      />
                    </div>
                    <div>
                      <span className={label}>{t("admin.offers.btn1Color")}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label={t("admin.offers.btn1Color")}
                          value={selected.btn1_color || "#ffffff"}
                          onChange={(e) => patch({ btn1_color: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ btn1_color: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.offers.colorDefault")}
                        </button>
                      </div>
                      <ColorSwatches
                        value={selected.btn1_color || "#ffffff"}
                        onPick={(hex) => patch({ btn1_color: hex })}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Background */}
                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.offers.bg")}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <span className={label}>{t("admin.offers.bgColor")}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label={t("admin.offers.bgColor")}
                          value={selected.bg_color || "#ffffff"}
                          onChange={(e) => patch({ bg_color: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ bg_color: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.offers.colorDefault")}
                        </button>
                      </div>
                      <ColorSwatches
                        value={selected.bg_color || "#ffffff"}
                        onPick={(hex) => patch({ bg_color: hex })}
                      />
                    </div>
                    <div>
                      <label className={label}>{t("admin.offers.bgOpacity")}</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={selected.bg_opacity}
                        onChange={(e) => patch({ bg_opacity: Number(e.target.value) })}
                        className="w-full accent-primary"
                      />
                      <p className="text-[12px] text-ink-soft mt-1 text-center">
                        {selected.bg_opacity}%
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <span className={label}>{t("admin.offers.bgShadowColor")}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label={t("admin.offers.bgShadowColor")}
                          value={selected.bg_shadow || "#000000"}
                          onChange={(e) => patch({ bg_shadow: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ bg_shadow: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.offers.colorDefault")}
                        </button>
                      </div>
                      <ColorSwatches
                        value={selected.bg_shadow || "#000000"}
                        onPick={(hex) => patch({ bg_shadow: hex })}
                      />
                    </div>
                    <div>
                      <label className={label}>{t("admin.offers.bgShadowOpacity")}</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={selected.bg_shadow_opacity}
                        onChange={(e) => patch({ bg_shadow_opacity: Number(e.target.value) })}
                        className="w-full accent-primary"
                      />
                      <p className="text-[12px] text-ink-soft mt-1 text-center">
                        {selected.bg_shadow_opacity}%
                      </p>
                    </div>
                  </div>
                </fieldset>

                {/* Placement */}
                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.offers.placement")}
                  </legend>
                  <PlacementSelect
                    value={selected.align}
                    onChange={(v) => patch({ align: v as Offer["align"] })}
                    title={t("admin.offers.align")}
                    options={[
                      { value: "start", key: "admin.offers.alignStart" },
                      { value: "center", key: "admin.offers.alignCenter" },
                      { value: "end", key: "admin.offers.alignEnd" },
                    ]}
                  />
                  <PlacementSelect
                    value={selected.valign}
                    onChange={(v) => patch({ valign: v as Offer["valign"] })}
                    title={t("admin.offers.valign")}
                    options={[
                      { value: "bottom", key: "admin.offers.valignBottom" },
                      { value: "center", key: "admin.offers.valignCenter" },
                    ]}
                  />
                </fieldset>
              </section>

              {/* Live preview */}
              <section className="lg:sticky lg:top-6 space-y-2">
                <p className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                  {t("admin.offers.preview")}
                </p>
                <div className="flex items-start justify-center">
                  <OfferPreview offer={selected} lang={lang} />
                </div>
                <p className="text-[12px] text-ink-soft">
                  {t("admin.offers.previewHint")}
                </p>
              </section>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
