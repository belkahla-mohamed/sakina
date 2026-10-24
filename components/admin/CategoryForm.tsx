"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, DeviceMobile, Handbag, Lamp, Pen, Sparkle } from "@phosphor-icons/react";
import { saveCategory, type ActionState } from "@/app/admin/actions";
import { useActionToast } from "@/components/admin/useActionToast";
import { ImageField } from "@/components/admin/ImageField";
import { useLang } from "@/components/providers";
import type { Category } from "@/lib/types";

const ICONS: Record<string, typeof Lamp> = {
  lamp: Lamp,
  handbag: Handbag,
  sparkle: Sparkle,
  device: DeviceMobile,
  pen: Pen,
};

/** Only the site brand colors are offered in the category picker. */
const COLOR_SWATCHES: { hex: string; key: string; label: string }[] = [
  { hex: "#76220a", key: "admin.category.colorGrenade", label: "Grenade" },
  { hex: "#f4f0e6", key: "admin.category.colorBeige", label: "Beige" },
  { hex: "#ffffff", key: "admin.category.colorWhite", label: "Blanc" },
  { hex: "#000000", key: "admin.category.colorBlack", label: "Noir" },
];

export function CategoryForm({ category }: { category?: Category }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveCategory,
    {}
  );
  useActionToast(state);
  const { t } = useLang();
  const isEdit = Boolean(category);
  const [color, setColor] = useState(category?.color ?? "#f4f0e6");
  const [icon, setIcon] = useState(category?.icon ?? "lamp");
  const [textChoice, setTextChoice] = useState(category?.text ?? "light");
  const [img, setImg] = useState(category?.image ?? "");

  const ICON_OPTIONS = [
    { value: "lamp", label: t("admin.category.iconLamp") },
    { value: "handbag", label: t("admin.category.iconHandbag") },
    { value: "sparkle", label: t("admin.category.iconSparkle") },
    { value: "device", label: t("admin.category.iconDevice") },
    { value: "pen", label: t("admin.category.iconPen") },
  ];

  const label = "block text-[13.5px] font-bold mb-1.5";
  const field = "field w-full px-3.5 py-2.5";

  const PreviewIcon = ICONS[icon] ?? Lamp;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {isEdit && <input type="hidden" name="existing_slug" value={category!.slug} />}

      {/* Identity */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">{t("admin.form.identity")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name_fr" className={label}>
              {t("admin.form.nameFr")} <span className="text-primary">*</span>
            </label>
            <input id="name_fr" name="name_fr" defaultValue={category?.name_fr} required className={field} />
          </div>
          <div>
            <label htmlFor="name_ar" className={label}>
              {t("admin.form.nameAr")} <span className="text-primary">*</span>
            </label>
            <input id="name_ar" name="name_ar" dir="rtl" defaultValue={category?.name_ar} required className={`${field} ar`} />
          </div>
        </div>
        <div>
          <label htmlFor="slug" className={label}>
            Slug {isEdit ? t("admin.form.slugUnchanged") : t("admin.form.slugGenerated")}
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={category?.slug}
            // `readOnly` (not `disabled`): a disabled control is dropped from
            // FormData, so the upsert would create a duplicate category.
            readOnly={isEdit}
            placeholder="jeux-en-bois"
            aria-readonly={isEdit}
            className={`${field} read-only:opacity-60 read-only:cursor-default`}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tagline_fr" className={label}>
              {t("admin.category.taglineFr")}
            </label>
            <input id="tagline_fr" name="tagline_fr" defaultValue={category?.tagline_fr ?? ""} className={field} />
          </div>
          <div>
            <label htmlFor="tagline_ar" className={label}>
              {t("admin.category.taglineAr")}
            </label>
            <input id="tagline_ar" name="tagline_ar" dir="rtl" defaultValue={category?.tagline_ar ?? ""} className={`${field} ar`} />
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">{t("admin.category.appearance")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="color" className={label}>
              {t("admin.category.color")}
            </label>
            <input type="hidden" name="color" value={color} />
            <div className="flex flex-wrap gap-2.5">
              {COLOR_SWATCHES.map((c) => {
                const active = color.toLowerCase() === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    aria-label={t(c.key as any)}
                    title={t(c.key as any)}
                    aria-pressed={active}
                    className={`w-10 h-10 rounded-[10px] border-2 transition-all ${
                      active ? "border-ink scale-110" : "border-line hover:border-ink/50"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {active && <Check size={14} weight="bold" className="text-white" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[12px] text-ink-soft mt-1.5">{t("admin.category.colorHint")}</p>
          </div>
          <div>
            <label htmlFor="text" className={label}>
              {t("admin.category.textColor")}
            </label>
            <select
              id="text"
              name="text"
              value={textChoice}
              onChange={(e) => setTextChoice(e.target.value as "light" | "dark")}
              className={field}
            >
              <option value="light">{t("admin.category.textLight")}</option>
              <option value="dark">{t("admin.category.textDark")}</option>
            </select>
          </div>
        </div>

        <div>
          <span className={label}>{t("admin.category.icon")}</span>
          <input type="hidden" name="icon" value={icon} />
          <div className="flex flex-wrap gap-2.5">
            {ICON_OPTIONS.map((opt) => {
              const Icon = ICONS[opt.value] ?? Lamp;
              const active = icon === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIcon(opt.value)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1.5 w-[76px] py-3 rounded-[12px] border-2 transition-colors ${
                    active ? "border-ink bg-highlight/25" : "border-line hover:border-ink/40"
                  }`}
                >
                  <Icon size={22} weight={active ? "fill" : "regular"} />
                  <span className="text-[11px] font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <ImageField
            name="image"
            value={category?.image ?? ""}
            kind="category"
            label={t("admin.category.imageLabel")}
            onUrlChange={setImg}
          />
        </div>

        {/* Live preview */}
        <div>
          <span className={label}>{t("admin.category.preview")}</span>
          <div
            className={`card flex items-center justify-between p-4 border-ink ${
              textChoice === "dark" ? "text-ink" : "text-white"
            }`}
            style={{ background: color }}
          >
            <div>
              <p className="font-display text-[16.5px] font-bold leading-tight">{t("admin.category.previewName")}</p>
              <p className={`text-[11.5px] mt-1 ${textChoice === "dark" ? "text-ink-soft" : "opacity-85"}`}>
                {t("admin.category.previewCount")}
              </p>
            </div>
            {img ? (
              <span className="relative block w-14 h-14 shrink-0 rounded-[12px] overflow-hidden border-2 border-ink/20 bg-white">
                <Image src={img} alt="" fill sizes="56px" className="object-cover" />
              </span>
            ) : (
              <PreviewIcon size={28} />
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-[14.5px] font-bold pt-1">
          <input type="checkbox" name="featured" defaultChecked={category?.featured} className="w-4.5 h-4.5 accent-primary" />
          {t("admin.category.featured")}
        </label>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? t("admin.form.pending") : isEdit ? t("admin.form.save") : t("admin.form.createCategory")}
        </button>
        <Link href="/admin/categories" className="btn btn-outline">
          {t("admin.form.cancel")}
        </Link>
      </div>
    </form>
  );
}
