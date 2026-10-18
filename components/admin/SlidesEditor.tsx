"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeSlash,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import { saveHeroSlides, type ActionState } from "@/app/admin/actions";
import { ImageField } from "@/components/admin/ImageField";
import { useActionToast } from "@/components/admin/useActionToast";
import {
  SlideContent,
  slidePlacementClasses,
  slideScrim,
} from "@/components/home/HeroSlider";
import { useLang } from "@/components/providers";
import { emptySlide, MAX_SLIDES } from "@/lib/hero-slides";
import type { TKey } from "@/lib/i18n";
import type { HeroSlide } from "@/lib/types";

const label = "block text-[13.5px] font-bold mb-1.5";
const field = "field w-full px-3.5 py-2.5";

const BRAND_SWATCHES: { hex: string; key: TKey }[] = [
  { hex: "#76220a", key: "admin.slides.colorBrick" },
  { hex: "#5c1a07", key: "admin.slides.colorBrickDeep" },
  { hex: "#2a1d16", key: "admin.slides.colorInk" },
  { hex: "#f4f0e6", key: "admin.slides.colorSand" },
  { hex: "#fcfbf6", key: "admin.slides.colorCream" },
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
            value.toLowerCase() === c.hex
              ? "border-ink scale-110"
              : "border-line hover:border-ink/50"
          }`}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}

export function SlidesEditor({ initial }: { initial: HeroSlide[] }) {
  const { t, lang } = useLang();
  const [slides, setSlides] = useState<HeroSlide[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveHeroSlides,
    {}
  );
  useActionToast(state);

  const selected = slides.find((s) => s.id === selectedId) ?? null;

  function patch(changes: Partial<HeroSlide>) {
    if (!selectedId) return;
    setSlides((prev) =>
      prev.map((s) => (s.id === selectedId ? { ...s, ...changes } : s))
    );
  }

  function addSlide() {
    const slide = emptySlide();
    setSlides((prev) =>
      prev.length >= MAX_SLIDES ? prev : [...prev, slide]
    );
    setSelectedId(slide.id);
  }

  function removeSlide(id: string) {
    setSlides((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function move(id: string, dir: -1 | 1) {
    setSlides((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {/* The whole slide list travels as JSON — one save for the whole slider. */}
      <input type="hidden" name="slides" value={JSON.stringify(slides)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addSlide}
          disabled={slides.length >= MAX_SLIDES}
          className="btn btn-outline disabled:opacity-50"
        >
          <Plus size={15} weight="bold" />
          {t("admin.slides.new")}
        </button>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? t("admin.form.pending") : t("admin.form.save")}
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[15px] text-ink-soft">{t("admin.slides.empty")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Slide list */}
          <ul className="space-y-2">
            {slides.map((s, i) => (
              <li key={s.id}>
                <div
                  className={`flex items-center gap-2 rounded-[12px] border-2 px-2.5 py-2 transition-colors ${
                    selectedId === s.id
                      ? "border-primary bg-primary/5"
                      : "border-line bg-white hover:border-ink/25"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-start"
                  >
                    <span className="relative w-16 h-11 shrink-0 rounded-[8px] overflow-hidden bg-milk border border-line block">
                      {s.image && (
                        <Image
                          src={s.image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold text-[14px] truncate">
                        {lang === "ar"
                          ? s.title_ar || s.title_fr || `#${i + 1}`
                          : s.title_fr || s.title_ar || `#${i + 1}`}
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-ink-soft">
                        {s.active ? (
                          <>
                            <Eye size={13} weight="bold" />
                            {t("admin.slides.active")}
                          </>
                        ) : (
                          <>
                            <EyeSlash size={13} weight="bold" />
                            {t("admin.slides.inactive")}
                          </>
                        )}
                      </span>
                    </span>
                  </button>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      aria-label={t("admin.slides.moveUp")}
                      onClick={() => move(s.id, -1)}
                      disabled={i === 0}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] text-ink-soft hover:bg-milk disabled:opacity-30"
                    >
                      <ArrowUp size={15} weight="bold" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("admin.slides.moveDown")}
                      onClick={() => move(s.id, 1)}
                      disabled={i === slides.length - 1}
                      className="w-8 h-8 flex items-center justify-center rounded-[8px] text-ink-soft hover:bg-milk disabled:opacity-30"
                    >
                      <ArrowDown size={15} weight="bold" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("admin.slides.delete")}
                      onClick={() => removeSlide(s.id)}
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
                  {t("admin.slides.editing")}
                </h2>

                <div className="flex items-center justify-between gap-3 rounded-[10px] bg-milk px-3.5 py-2.5">
                  <span className="text-[13.5px] font-bold">
                    {t("admin.slides.active")}
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

                <ImageField
                  key={`img-${selected.id}`}
                  kind="hero"
                  value={selected.image}
                  label={t("admin.slides.image")}
                  onUrlChange={(url) => patch({ image: url })}
                />
                <p className="text-[12px] text-ink-soft -mt-2">
                  {t("admin.slides.imageHint")}
                </p>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className={label} htmlFor={`t-fr-${selected.id}`}>
                      {t("admin.slides.titleFr")}
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
                      {t("admin.slides.titleAr")}
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
                      {t("admin.slides.textFr")}
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
                      {t("admin.slides.textAr")}
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

                <fieldset className="space-y-2.5 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.slides.visibility")}
                  </legend>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <label className="flex items-center gap-2 text-[13.5px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.show_title}
                        onChange={(e) => patch({ show_title: e.target.checked })}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      {t("admin.slides.showTitle")}
                    </label>
                    <label className="flex items-center gap-2 text-[13.5px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.show_text}
                        onChange={(e) => patch({ show_text: e.target.checked })}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      {t("admin.slides.showText")}
                    </label>
                    <label className="flex items-center gap-2 text-[13.5px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.show_btns}
                        onChange={(e) => patch({ show_btns: e.target.checked })}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      {t("admin.slides.showBtns")}
                    </label>
                  </div>
                  <p className="text-[12px] text-ink-soft">
                    {t("admin.slides.visibilityHint")}
                  </p>
                </fieldset>

                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.slides.btn1")}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={label} htmlFor={`b1-fr-${selected.id}`}>
                        {t("admin.slides.btnLabel")} (FR)
                      </label>
                      <input
                        id={`b1-fr-${selected.id}`}
                        value={selected.btn_label_fr}
                        maxLength={40}
                        onChange={(e) => patch({ btn_label_fr: e.target.value })}
                        className={field}
                      />
                    </div>
                    <div>
                      <label className={label} htmlFor={`b1-ar-${selected.id}`}>
                        {t("admin.slides.btnLabel")} (AR)
                      </label>
                      <input
                        id={`b1-ar-${selected.id}`}
                        dir="rtl"
                        value={selected.btn_label_ar}
                        maxLength={40}
                        onChange={(e) => patch({ btn_label_ar: e.target.value })}
                        className={`${field} ar`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={label} htmlFor={`b1-href-${selected.id}`}>
                      {t("admin.slides.btnHref")}
                    </label>
                    <input
                      id={`b1-href-${selected.id}`}
                      dir="ltr"
                      value={selected.btn_href}
                      maxLength={500}
                      placeholder="/shop"
                      onChange={(e) => patch({ btn_href: e.target.value })}
                      className={`${field} font-mono`}
                    />
                    <p className="text-[12px] text-ink-soft mt-1.5">
                      {t("admin.slides.btnHrefHint")}
                    </p>
                  </div>
                </fieldset>

                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.slides.btn2")}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={label} htmlFor={`b2-fr-${selected.id}`}>
                        {t("admin.slides.btnLabel")} (FR)
                      </label>
                      <input
                        id={`b2-fr-${selected.id}`}
                        value={selected.btn2_label_fr}
                        maxLength={40}
                        onChange={(e) => patch({ btn2_label_fr: e.target.value })}
                        className={field}
                      />
                    </div>
                    <div>
                      <label className={label} htmlFor={`b2-ar-${selected.id}`}>
                        {t("admin.slides.btnLabel")} (AR)
                      </label>
                      <input
                        id={`b2-ar-${selected.id}`}
                        dir="rtl"
                        value={selected.btn2_label_ar}
                        maxLength={40}
                        onChange={(e) => patch({ btn2_label_ar: e.target.value })}
                        className={`${field} ar`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={label} htmlFor={`b2-href-${selected.id}`}>
                      {t("admin.slides.btnHref")}
                    </label>
                    <input
                      id={`b2-href-${selected.id}`}
                      dir="ltr"
                      value={selected.btn2_href}
                      maxLength={500}
                      onChange={(e) => patch({ btn2_href: e.target.value })}
                      className={`${field} font-mono`}
                    />
                  </div>
                </fieldset>

                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.slides.btnStyle")}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <span className={label}>{t("admin.slides.btn1Bg")}</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="color"
                          aria-label={t("admin.slides.btn1Bg")}
                          value={selected.btn1_bg || "#ffffff"}
                          onChange={(e) => patch({ btn1_bg: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ btn1_bg: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.slides.colorDefault")}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className={label}>{t("admin.slides.btn1Color")}</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="color"
                          aria-label={t("admin.slides.btn1Color")}
                          value={selected.btn1_color || "#2a1d16"}
                          onChange={(e) => patch({ btn1_color: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ btn1_color: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.slides.colorDefault")}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className={label}>{t("admin.slides.btn2Bg")}</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="color"
                          aria-label={t("admin.slides.btn2Bg")}
                          value={selected.btn2_bg || "#000000"}
                          onChange={(e) => patch({ btn2_bg: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ btn2_bg: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.slides.colorDefault")}
                        </button>
                      </div>
                    </div>
                    <div>
                      <span className={label}>{t("admin.slides.btn2Color")}</span>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="color"
                          aria-label={t("admin.slides.btn2Color")}
                          value={selected.btn2_color || "#ffffff"}
                          onChange={(e) => patch({ btn2_color: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ btn2_color: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.slides.colorDefault")}
                        </button>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.slides.colors")}
                  </legend>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <span className={label}>{t("admin.slides.titleColor")}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label={t("admin.slides.titleColor")}
                          value={selected.title_color || "#ffffff"}
                          onChange={(e) => patch({ title_color: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ title_color: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.slides.colorWhite")}
                        </button>
                      </div>
                      <ColorSwatches
                        value={selected.title_color || "#ffffff"}
                        onPick={(hex) => patch({ title_color: hex })}
                      />
                    </div>
                    <div>
                      <span className={label}>{t("admin.slides.textColor")}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label={t("admin.slides.textColor")}
                          value={selected.text_color || "#ffffff"}
                          onChange={(e) => patch({ text_color: e.target.value })}
                          className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => patch({ text_color: "" })}
                          className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                        >
                          {t("admin.slides.colorWhite")}
                        </button>
                      </div>
                      <ColorSwatches
                        value={selected.text_color || "#ffffff"}
                        onPick={(hex) => patch({ text_color: hex })}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={label}>{t("admin.slides.overlayColor")}</span>
                      <button
                        type="button"
                        onClick={() => patch({ overlay_color: "" })}
                        className="text-[12px] font-bold text-ink-soft underline underline-offset-2 hover:text-ink"
                      >
                        {t("admin.slides.colorDefault")}
                      </button>
                    </div>
                    <input
                      type="color"
                      aria-label={t("admin.slides.overlayColor")}
                      value={selected.overlay_color || "#2a1d16"}
                      onChange={(e) => patch({ overlay_color: e.target.value })}
                      className="w-10 h-10 rounded-[6px] border border-line bg-white p-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className={label} htmlFor={`ov-${selected.id}`}>
                        {t("admin.slides.overlay")}
                      </label>
                      <span className="text-[12px] font-bold tabular-nums text-ink-soft">
                        {selected.overlay}%
                      </span>
                    </div>
                    <input
                      id={`ov-${selected.id}`}
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={selected.overlay}
                      onChange={(e) => patch({ overlay: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                    <p className="text-[12px] text-ink-soft mt-1">
                      {t("admin.slides.overlayHint")}
                    </p>
                  </div>
                </fieldset>

                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.slides.typography")}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={label} htmlFor={`tf-${selected.id}`}>
                        {t("admin.slides.titleFont")}
                      </label>
                      <select
                        id={`tf-${selected.id}`}
                        value={selected.title_font}
                        onChange={(e) => patch({ title_font: e.target.value })}
                        className={field}
                      >
                        <option value="">{t("admin.slides.fontDefault")}</option>
                        <option value="display">{t("admin.slides.fontDisplay")}</option>
                        <option value="body">{t("admin.slides.fontBody")}</option>
                      </select>
                    </div>
                    <div>
                      <label className={label} htmlFor={`bf-${selected.id}`}>
                        {t("admin.slides.textFont")}
                      </label>
                      <select
                        id={`bf-${selected.id}`}
                        value={selected.text_font}
                        onChange={(e) => patch({ text_font: e.target.value })}
                        className={field}
                      >
                        <option value="">{t("admin.slides.fontDefault")}</option>
                        <option value="display">{t("admin.slides.fontDisplay")}</option>
                        <option value="body">{t("admin.slides.fontBody")}</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={label} htmlFor={`ts-${selected.id}`}>
                          {t("admin.slides.titleSize")}
                        </label>
                        <span className="text-[12px] font-bold tabular-nums text-ink-soft">
                          {selected.title_size ? `${selected.title_size}px` : "—"}
                        </span>
                      </div>
                      <input
                        type="number"
                        id={`ts-${selected.id}`}
                        min={12}
                        max={80}
                        value={selected.title_size || ""}
                        placeholder="40"
                        onChange={(e) =>
                          patch({ title_size: Math.min(80, Math.max(0, Number(e.target.value) || 0)) })
                        }
                        className={field}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <label className={label} htmlFor={`xs-${selected.id}`}>
                          {t("admin.slides.textSize")}
                        </label>
                        <span className="text-[12px] font-bold tabular-nums text-ink-soft">
                          {selected.text_size ? `${selected.text_size}px` : "—"}
                        </span>
                      </div>
                      <input
                        type="number"
                        id={`xs-${selected.id}`}
                        min={10}
                        max={48}
                        value={selected.text_size || ""}
                        placeholder="17"
                        onChange={(e) =>
                          patch({ text_size: Math.min(48, Math.max(0, Number(e.target.value) || 0)) })
                        }
                        className={field}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <label className="flex items-center gap-2 text-[13.5px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.title_bold}
                        onChange={(e) => patch({ title_bold: e.target.checked })}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      {t("admin.slides.titleBold")}
                    </label>
                    <label className="flex items-center gap-2 text-[13.5px] font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.title_underline}
                        onChange={(e) => patch({ title_underline: e.target.checked })}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                      {t("admin.slides.titleUnderline")}
                    </label>
                  </div>
                </fieldset>

                <fieldset className="space-y-3 border border-line rounded-[10px] p-3.5">
                  <legend className="px-1 text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-soft">
                    {t("admin.slides.placement")}
                  </legend>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className={label} htmlFor={`al-${selected.id}`}>
                        {t("admin.slides.align")}
                      </label>
                      <select
                        id={`al-${selected.id}`}
                        value={selected.align}
                        onChange={(e) => patch({ align: e.target.value as "start" | "center" | "end" })}
                        className={field}
                      >
                        <option value="start">{t("admin.slides.alignStart")}</option>
                        <option value="center">{t("admin.slides.alignCenter")}</option>
                        <option value="end">{t("admin.slides.alignEnd")}</option>
                      </select>
                    </div>
                    <div>
                      <label className={label} htmlFor={`va-${selected.id}`}>
                        {t("admin.slides.valign")}
                      </label>
                      <select
                        id={`va-${selected.id}`}
                        value={selected.valign}
                        onChange={(e) => patch({ valign: e.target.value as "bottom" | "center" })}
                        className={field}
                      >
                        <option value="bottom">{t("admin.slides.valignBottom")}</option>
                        <option value="center">{t("admin.slides.valignCenter")}</option>
                      </select>
                    </div>
                  </div>
                </fieldset>
              </section>

              {/* Live preview — same SlideContent the homepage renders */}
              <section className="lg:sticky lg:top-6 space-y-2">
                <p className="text-[12.5px] font-bold uppercase tracking-[0.12em] text-ink-soft">
                  {t("admin.slides.preview")}
                </p>
                <div className="relative h-[260px] rounded-[14px] overflow-hidden border-2 border-line bg-ink">
                  {selected.image && (
                    <Image
                      src={selected.image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-contain"
                    />
                  )}
                  <div
                    className={slideScrim(selected).className}
                    style={slideScrim(selected).style}
                    aria-hidden
                  />
                  <div
                    className={`relative h-full flex ${slidePlacementClasses(selected)} p-5`}
                  >
                    <SlideContent slide={selected} lang={lang} />
                  </div>
                </div>
                <p className="text-[12px] text-ink-soft">
                  {t("admin.slides.previewHint")}
                </p>
              </section>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
