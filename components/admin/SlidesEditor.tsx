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
import { SlideContent } from "@/components/home/HeroSlider";
import { useLang } from "@/components/providers";
import { emptySlide, MAX_SLIDES } from "@/lib/hero-slides";
import type { HeroSlide } from "@/lib/types";

const label = "block text-[13.5px] font-bold mb-1.5";
const field = "field w-full px-3.5 py-2.5";

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
                          className="object-cover"
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
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/45 to-ink/20" />
                  <div className="relative h-full flex items-end p-5">
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
