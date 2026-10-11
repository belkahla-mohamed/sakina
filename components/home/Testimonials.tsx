"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Star, CheckCircle, Plus, PaperPlaneTilt } from "@phosphor-icons/react";
import { useLang, useSettings } from "@/components/providers";
import { buildReviewMessage, openWhatsApp } from "@/lib/whatsapp";

const REVIEWS = [
  {
    text_fr:
      "Livraison super rapide à Casablanca et le colis était parfaitement emballé. Ma fille a adoré son puzzle !",
    text_ar: "وصل الطلب بسرعة إلى الدار البيضاء ومغلّف بشكل ممتاز. ابنتي أحبّت الأحجية!",
    name: "Salma",
    city_fr: "Casablanca",
    city_ar: "الدار البيضاء",
    date: "12/09/2026",
    initial: "S",
    color: "#FF6B9D",
  },
  {
    text_fr:
      "Je commande depuis 3 mois : toujours le même sérieux, et je paie à la livraison sans souci.",
    text_ar: "أطلب منذ ثلاثة أشهر: نفس الجدية دائمًا، وأدفع عند الاستلام دون أي مشكل.",
    name: "Nadia",
    city_fr: "Rabat",
    city_ar: "الرباط",
    date: "28/08/2026",
    initial: "N",
    color: "#2EC4B6",
  },
  {
    text_fr:
      "Le pack rentrée scolaire est parfait, tout est dedans. Je recommande les yeux fermés.",
    text_ar: "حزمة العودة إلى المدرسة ممتازة، كل شيء موجود فيها. أنصح بها بشدة.",
    name: "Imane",
    city_fr: "Marrakech",
    city_ar: "مراكش",
    date: "05/09/2026",
    initial: "I",
    color: "#A78BFA",
  },
];

const BARS = [
  { stars: 5, pct: 94 },
  { stars: 4, pct: 4 },
  { stars: 3, pct: 1 },
  { stars: 2, pct: 1 },
  { stars: 1, pct: 0 },
];

const AVATAR_COLORS = ["#FF6B9D", "#2EC4B6", "#A78BFA", "#FFD166"];
const REVIEWS_KEY = "sakina_reviews_v1";

interface LocalReview {
  name: string;
  city: string;
  rating: number;
  text: string;
  date: string;
}

function subscribeReviews(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener("sakina-store", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("sakina-store", handler);
  };
}

function readReviewsRaw(): string | null {
  try {
    return window.localStorage.getItem(REVIEWS_KEY);
  } catch {
    return null;
  }
}

function parseReviews(raw: string | null): LocalReview[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is LocalReview =>
        typeof r?.name === "string" &&
        typeof r?.text === "string" &&
        typeof r?.rating === "number"
    );
  } catch {
    return [];
  }
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 text-highlight" aria-label={`${count}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} weight={i < count ? "fill" : "regular"} />
      ))}
    </div>
  );
}

export function Testimonials() {
  const { lang, t } = useLang();
  const settings = useSettings();

  const storedReviews = useSyncExternalStore(subscribeReviews, readReviewsRaw, () => null);
  const mine = useMemo(() => parseReviews(storedReviews), [storedReviews]);
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = {
      rating: rating < 1,
      name: !name.trim(),
      text: !text.trim(),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    const message = buildReviewMessage({ name, city, rating, text });
    openWhatsApp(message, settings.whatsapp);

    const review: LocalReview = {
      name: name.trim(),
      city: city.trim(),
      rating,
      text: text.trim(),
      date: new Date().toLocaleDateString("fr-FR"),
    };
    try {
      const next = [review, ...parseReviews(readReviewsRaw())];
      window.localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("sakina-store"));
    } catch {
      /* storage unavailable */
    }
    setSent(true);
    setOpen(false);
    setRating(0);
    setName("");
    setCity("");
    setText("");
  }

  function closeForm() {
    setOpen(false);
    setErrors({});
  }

  const cards = [
    ...mine.map((r, i) => ({
      key: `mine-${i}`,
      text: r.text,
      name: r.name,
      city: r.city,
      date: r.date,
      rating: r.rating,
      initial: r.name.trim().charAt(0).toUpperCase() || "?",
      color: AVATAR_COLORS[r.name.length % AVATAR_COLORS.length],
      isMine: true,
    })),
    ...REVIEWS.map((r) => ({
      key: r.name,
      text: lang === "ar" ? r.text_ar : r.text_fr,
      name: r.name,
      city: lang === "ar" ? r.city_ar : r.city_fr,
      date: r.date,
      rating: 5,
      initial: r.initial,
      color: r.color,
      isMine: false,
    })),
  ]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <section className="bg-white border-y-2 border-line anim-reveal">
      <div className="mx-auto max-w-6xl px-4 lg:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-[0.75fr_1.5fr] gap-6">
          <div className="card p-6 flex flex-col justify-center bg-milk">
            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-ink-soft">
              {t("home.testiScore")}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-[52px] font-extrabold leading-none">5,00</span>
              <span className="text-ink-soft font-bold">/ 5</span>
            </div>
            <div className="flex gap-1 mt-1 text-highlight">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={19} weight="fill" />
              ))}
            </div>
            <p className="text-[13px] font-bold text-ink-soft mt-1">{t("home.testiCount")}</p>

            <div className="mt-4 space-y-1.5">
              {BARS.map((b) => (
                <div key={b.stars} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-8 text-ink-soft font-bold">{b.stars}★</span>
                  <span className="flex-1 h-2.5 rounded-full bg-line overflow-hidden">
                    <span
                      className="block h-full rounded-full bg-highlight"
                      style={{ width: `${b.pct}%` }}
                    />
                  </span>
                  <span className="w-8 text-end text-ink-soft">{b.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="grid sm:grid-cols-3 gap-4">
              {cards.map((r) => (
                <div key={r.key} className="card p-5 flex flex-col">
                  <div className="flex items-center justify-between">
                    <Stars count={r.rating} />
                    {r.isMine ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-primary">
                        <Star size={12} weight="fill" /> {t("testi.mine")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-teal-deep">
                        <CheckCircle size={13} weight="fill" /> {t("home.testiVerified")}
                      </span>
                    )}
                  </div>
                  <p className={`text-[13.5px] mt-3 flex-1 ${lang === "ar" ? "ar" : ""}`}>
                    “{r.text}”
                  </p>
                  <div className="flex items-center gap-2.5 mt-4 pt-3 border-t-2 border-line">
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-[14px]"
                      style={{ background: r.color }}
                    >
                      {r.initial}
                    </span>
                    <div className="leading-tight">
                      <p className="font-bold text-[13.5px]">{r.name}</p>
                      <p className="text-[11.5px] text-ink-soft">
                        {r.city ? `${r.city} · ` : ""}
                        {r.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
                <div className="card p-5 flex items-center gap-3 anim-fade-up">
                  <CheckCircle size={24} weight="fill" className="text-teal-deep shrink-0" />
                  <p className="font-bold text-[14.5px]">{t("testi.thanks")}</p>
                </div>
              )}

              {open && (
                <form onSubmit={submit} className="card p-5 anim-rise space-y-4">
                  <p className="font-display font-bold text-[17px]">{t("testi.formTitle")}</p>

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
                          className="p-1"
                        >
                          <Star
                            size={28}
                            weight={n <= rating ? "fill" : "regular"}
                            className={n <= rating ? "text-highlight" : "text-ink-soft"}
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
                        className="field w-full px-4 py-3 outline-none focus:border-ink"
                        data-error={errors.name ? "true" : undefined}
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
                        className="field w-full px-4 py-3 outline-none focus:border-ink"
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
                      className="field w-full px-4 py-3 outline-none focus:border-ink resize-y"
                      data-error={errors.text ? "true" : undefined}
                    />
                    {errors.text && (
                      <p className="text-[12.5px] text-primary font-bold mt-1 anim-fade-in">
                        {t("form.required")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="submit" className="btn btn-primary flex-1 sm:flex-none">
                      <PaperPlaneTilt size={17} weight="bold" /> {t("form.send")}
                    </button>
                    <button type="button" onClick={closeForm} className="btn btn-outline">
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
