"use client";

import { useMemo, useState, useTransition } from "react";
import { Star, CheckCircle, Plus, PaperPlaneTilt } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";
import { submitReview } from "@/app/(store)/actions/reviews";
import type { ReviewRow } from "@/lib/db/reviews";

const AVATAR_COLORS = ["#0c6b62", "#e0a11c", "#151634", "#b24327", "#76220a"];

function formatDate(iso: string, lang: "fr" | "ar"): string {
  try {
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Africa/Casablanca",
    });
  } catch {
    return "";
  }
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 text-highlight" role="img" aria-label={`${count}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} weight={i < count ? "fill" : "regular"} />
      ))}
    </div>
  );
}

export function Testimonials({ reviews = [] }: { reviews?: ReviewRow[] }) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [text, setText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [isPending, startTransition] = useTransition();

  // Dynamic calculations from database reviews
  const totalCount = reviews.length;
  const avgScore = useMemo(() => {
    if (totalCount === 0) return "—";
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / totalCount).toFixed(2).replace(".", ",");
  }, [reviews, totalCount]);

  const bars = useMemo(() => {
    return [5, 4, 3, 2, 1].map((s) => {
      if (totalCount === 0) {
        return { stars: s, pct: 0 };
      }
      const matching = reviews.filter((r) => Math.round(Number(r.rating)) === s).length;
      const pct = Math.round((matching / totalCount) * 100);
      return { stars: s, pct };
    });
  }, [reviews, totalCount]);

  // Display top 3 reviews
  const displayedReviews = useMemo(() => {
    return reviews.slice(0, 3);
  }, [reviews]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    const nextErrors = {
      rating: rating < 1,
      name: !name.trim(),
      text: !text.trim(),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    startTransition(async () => {
      const res = await submitReview({
        name: name.trim(),
        city: city.trim() || undefined,
        rating,
        text: text.trim(),
      });

      if (res.ok) {
        setSent(true);
        setOpen(false);
        setName("");
        setCity("");
        setText("");
        setRating(5);
        setErrors({});
      } else {
        setErrorMsg(res.error || "Une erreur est survenue.");
      }
    });
  }

  function closeForm() {
    setOpen(false);
    setErrorMsg("");
    setErrors({});
  }

  // Automatically hide the entire section if there are no approved reviews
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-white border-y-2 border-line anim-reveal">
      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-[0.75fr_1.5fr] gap-6">
          {/* Summary card */}
          <div className="card p-6 flex flex-col justify-center bg-milk">
            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-ink-soft">
              {t("home.testiScore")}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-[52px] font-extrabold leading-none">
                {avgScore}
              </span>
              {totalCount > 0 && <span className="text-ink-soft font-bold">/ 5</span>}
            </div>
            <div className="flex gap-1 mt-1 text-highlight">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={19} weight={totalCount > 0 ? "fill" : "regular"} />
              ))}
            </div>
            <p className="text-[13px] font-bold text-ink-soft mt-1">
              {totalCount > 0
                ? `${totalCount} ${lang === "ar" ? "تقييمًا موثّقًا" : "avis vérifiés"}`
                : lang === "ar"
                ? "0 تقييمات موثقة"
                : "0 avis vérifié"}
            </p>

            <div className="mt-4 space-y-1.5">
              {bars.map((b) => (
                <div key={b.stars} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-8 text-ink-soft font-bold">{b.stars}★</span>
                  <span className="flex-1 h-2.5 rounded-full bg-line overflow-hidden">
                    <span
                      className="block h-full rounded-full bg-highlight transition-all duration-500"
                      style={{ width: `${b.pct}%` }}
                    />
                  </span>
                  <span className="w-8 text-end text-ink-soft">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews list & submission */}
          <div>
            {displayedReviews.length === 0 ? (
              <div className="card p-8 text-center flex flex-col items-center justify-center border-dashed border-2 border-line bg-milk/40 min-h-[180px]">
                <p className="font-bold text-ink-soft text-[14px]">
                  {lang === "ar"
                    ? "لا توجد تقييمات معتمدة حالياً. شاركنا تجربتك وكن أول من يضيف تقييماً!"
                    : "Aucun avis publié pour le moment. Soyez le premier à partager votre expérience !"}
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-4">
                {displayedReviews.map((r, i) => {
                  const initial = r.name.trim().charAt(0).toUpperCase() || "?";
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const dateStr = formatDate(r.created_at, lang);

                return (
                  <div key={r.id} className="card p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <Stars count={Number(r.rating) || 5} />
                        <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-teal-deep">
                          <CheckCircle size={13} weight="fill" /> {t("home.testiVerified")}
                        </span>
                      </div>
                      <p className={`text-[13.5px] mt-3 leading-relaxed text-ink/90 ${lang === "ar" ? "ar" : ""}`}>
                        “{r.text}”
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 mt-4 pt-3 border-t-2 border-line">
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-[14px] shrink-0"
                        style={{ background: color }}
                      >
                        {initial}
                      </span>
                      <div className="leading-tight min-w-0">
                        <p className="font-bold text-[13.5px] truncate">{r.name}</p>
                        <p className="text-[11.5px] text-ink-soft truncate flex items-center gap-1.5">
                          {r.city && <span>{r.city}</span>}
                          {r.city && <span className="opacity-40">·</span>}
                          <time className="tabular-nums" dir="ltr">{dateStr}</time>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            <div className="mt-5">
              {!open && !sent && (
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="btn btn-outline inline-flex"
                >
                  <Plus size={17} weight="bold" /> {t("testi.add")}
                </button>
              )}

              {sent && (
                <div className="card p-5 flex items-center gap-3 anim-fade-up bg-teal-deep/5 border-teal-deep/20">
                  <CheckCircle size={26} weight="fill" className="text-teal-deep shrink-0" />
                  <p className="font-bold text-[14.5px] text-teal-deep">
                    {t("testi.thanks")}
                  </p>
                </div>
              )}

              {open && (
                <form onSubmit={handleSubmit} className="card p-5 anim-rise space-y-4">
                  <p className="font-display font-bold text-[17px]">{t("testi.formTitle")}</p>

                  {errorMsg && (
                    <div className="p-3 text-[13px] rounded-[10px] bg-primary/10 border border-primary/20 text-primary font-bold">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <span className="block text-[13.5px] font-bold mb-1.5">
                      {t("testi.rating")} <span className="text-primary">*</span>
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          aria-label={`${n}/5`}
                          aria-pressed={rating === n}
                          onClick={() => {
                            setRating(n);
                            setErrors((prev) => ({ ...prev, rating: false }));
                          }}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            size={28}
                            weight={n <= rating ? "fill" : "regular"}
                            className={n <= rating ? "text-highlight" : "text-ink-soft/40"}
                          />
                        </button>
                      ))}
                    </div>
                    {errors.rating && (
                      <p className="text-[12.5px] text-primary font-bold mt-1 anim-fade-in">
                        {t("form.required")}
                      </p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="review-name" className="block text-[13.5px] font-bold mb-1.5">
                        {t("form.name")} <span className="text-primary">*</span>
                      </label>
                      <input
                        id="review-name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setErrors((prev) => ({ ...prev, name: false }));
                        }}
                        className="field w-full px-4 py-2.5 outline-none focus:border-ink"
                        data-error={errors.name ? "true" : undefined}
                        placeholder={lang === "ar" ? "الاسم الكامل" : "Votre nom"}
                      />
                      {errors.name && (
                        <p className="text-[12.5px] text-primary font-bold mt-1 anim-fade-in">
                          {t("form.required")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="review-city" className="block text-[13.5px] font-bold mb-1.5">
                        {t("form.city")}
                      </label>
                      <input
                        id="review-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="field w-full px-4 py-2.5 outline-none focus:border-ink"
                        placeholder={lang === "ar" ? "المدينة (مثال: الدار البيضاء)" : "Ex: Casablanca"}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review-text" className="block text-[13.5px] font-bold mb-1.5">
                      {t("testi.comment")} <span className="text-primary">*</span>
                    </label>
                    <textarea
                      id="review-text"
                      rows={3}
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        setErrors((prev) => ({ ...prev, text: false }));
                      }}
                      className="field w-full px-4 py-2.5 outline-none focus:border-ink resize-y"
                      data-error={errors.text ? "true" : undefined}
                      placeholder={
                        lang === "ar"
                          ? "اكتب رأيك هنا بكل صراحة..."
                          : "Partagez votre avis sur vos achats..."
                      }
                    />
                    {errors.text && (
                      <p className="text-[12.5px] text-primary font-bold mt-1 anim-fade-in">
                        {t("form.required")}
                      </p>
                    )}
                  </div>

                  <p className="text-[12px] text-ink-soft">
                    {lang === "ar"
                      ? "🔒 سيتم مراجعة تقييمك من طرف الإدارة قبل نشره على الموقع."
                      : "🔒 Votre avis sera soumis à modération avant d'apparaître sur le site."}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="btn btn-primary flex-1 sm:flex-none disabled:opacity-60"
                    >
                      <PaperPlaneTilt size={17} weight="bold" />
                      {isPending
                        ? lang === "ar"
                          ? "جاري الإرسال..."
                          : "Envoi..."
                        : t("form.send")}
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={closeForm}
                      className="btn btn-outline"
                    >
                      {t("testi.cancel")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
