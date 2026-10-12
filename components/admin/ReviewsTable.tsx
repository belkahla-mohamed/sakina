"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, Star, Trash, X } from "@phosphor-icons/react";
import { deleteReview, deleteReviews, setReviewStatus, type ActionState } from "@/app/admin/actions";
import { useConfirm } from "@/components/admin/Toast";
import { useActionToast } from "@/components/admin/useActionToast";
import { useLang } from "@/components/providers";
import type { ReviewRow, ReviewStatus } from "@/lib/db/reviews";

const STATUS_CLS: Record<ReviewStatus, string> = {
  pending: "bg-highlight text-ink",
  approved: "bg-teal-deep text-white",
  rejected: "bg-line text-ink-soft",
};

const STATUS_KEY = {
  pending: "admin.dash.pending",
  approved: "admin.review.approved",
  rejected: "admin.review.rejected",
} as const;

const FILTER_KEYS = [
  { value: "", key: "admin.table.all" },
  { value: "pending", key: "admin.dash.pending" },
  { value: "approved", key: "admin.review.approvedPl" },
  { value: "rejected", key: "admin.review.rejectedPl" },
] as const;

function formatDate(iso: string, lang: "fr" | "ar"): string {
  return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [statusState, statusAction] = useActionState<ActionState, FormData>(
    setReviewStatus,
    {}
  );
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(
    deleteReview,
    {}
  );
  const [bulkState, bulkAction, bulkPending] = useActionState<ActionState, FormData>(
    deleteReviews,
    {}
  );
  useActionToast(statusState);
  useActionToast(deleteState);
  useActionToast(bulkState);
  const askConfirm = useConfirm();
  const { t, lang } = useLang();

  const allIds = useMemo(() => new Set(reviews.map((r) => r.id)), [reviews]);
  const bulkIds = useMemo(
    () => [...selected].filter((id) => allIds.has(id)),
    [selected, allIds]
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = { "": reviews.length };
    for (const r of reviews) m[r.status] = (m[r.status] ?? 0) + 1;
    return m;
  }, [reviews]);

  const rows = useMemo(
    () => (filter ? reviews.filter((r) => r.status === filter) : reviews),
    [reviews, filter]
  );

  const allVisible = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const someVisible = rows.some((r) => selected.has(r.id));

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (rows.length > 0 && rows.every((r) => next.has(r.id))) {
        for (const r of rows) next.delete(r.id);
      } else {
        for (const r of rows) next.add(r.id);
      }
      return next;
    });
  }

  if (reviews.length === 0) {
    return (
      <div className="card p-12 text-center text-[14.5px] text-ink-soft">
        {t("admin.review.none")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[13px] font-bold border-2 border-line cursor-pointer hover:border-ink/40">
          <input
            type="checkbox"
            checked={allVisible}
            ref={(el) => {
              if (el) el.indeterminate = someVisible && !allVisible;
            }}
            onChange={toggleAll}
            aria-label={t("admin.table.selectAll")}
            className="w-4 h-4 accent-primary"
          />
          {t("admin.table.selectAll")}
        </label>
        {FILTER_KEYS.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={active}
              className={`px-3.5 py-2 rounded-full text-[13px] font-bold border-2 transition-colors ${
                active ? "bg-ink text-white border-ink" : "border-line hover:border-ink/40"
              }`}
            >
              {t(f.key)}
              <span className={`ms-1.5 ${active ? "opacity-70" : "text-ink-soft"}`}>
                {counts[f.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-[14.5px] text-ink-soft">
          {t("admin.review.noFilter")}
        </div>
      ) : (
        <>
          {bulkIds.length > 0 && (
            <form
              action={bulkAction}
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                void askConfirm({
                  title: t("admin.table.delReviewsTitle"),
                  message: t("admin.table.delReviewsMsg").replace("{n}", String(bulkIds.length)),
                  confirmLabel: t("admin.table.delete"),
                  tone: "danger",
                }).then((ok) => {
                  if (ok) form.requestSubmit();
                });
              }}
              className="card px-4 py-3 flex flex-wrap items-center gap-3 border-primary"
            >
              {bulkIds.map((id) => (
                <input key={id} type="hidden" name="ids" value={id} />
              ))}
              <span className="text-[13.5px] font-bold">
                {t("admin.table.selCount").replace("{n}", String(bulkIds.length))}
              </span>
              <button
                type="submit"
                disabled={bulkPending}
                className="btn !px-3 !py-2 text-[13px] border-2 border-line text-primary hover:border-primary ms-auto disabled:opacity-60"
              >
                <Trash size={15} weight="bold" />
                {t("admin.table.deleteSelected")}
              </button>
            </form>
          )}
          <ul className="space-y-3">
          {rows.map((r) => {
            const cls = STATUS_CLS[r.status] ?? STATUS_CLS.pending;
            const sk = STATUS_KEY[r.status as keyof typeof STATUS_KEY];
            return (
              <li key={r.id} className="card p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggleOne(r.id)}
                      aria-label={t("admin.table.selectItem").replace("{n}", r.name)}
                      className="w-4.5 h-4.5 accent-primary shrink-0"
                    />
                    <span className="w-10 h-10 rounded-full bg-highlight/40 border border-line flex items-center justify-center font-display font-bold text-[15px] shrink-0">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-bold text-[14.5px] leading-tight">{r.name}</p>
                      <p className="text-[12.5px] text-ink-soft">
                        {r.city ? `${r.city} · ` : ""}
                        {formatDate(r.created_at, lang)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-0.5" role="img" aria-label={`${r.rating} ${t("admin.review.ofFive")}`}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={15}
                          weight={i <= r.rating ? "fill" : "regular"}
                          className={i <= r.rating ? "text-highlight" : "text-line"}
                        />
                      ))}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${cls}`}>
                      {sk ? t(sk) : r.status}
                    </span>
                  </div>
                </div>

                <p className="text-[14px] leading-relaxed bg-milk border border-line rounded-[10px] px-3.5 py-2.5">
                  {r.text}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  {r.status !== "approved" && (
                    <form action={statusAction} className="inline">
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button
                        type="submit"
                        className="btn !px-3 !py-2 text-[13px] bg-teal-deep text-white hover:opacity-90"
                      >
                        <Check size={15} weight="bold" />
                        {t("admin.review.approve")}
                      </button>
                    </form>
                  )}
                  {r.status !== "rejected" && (
                    <form action={statusAction} className="inline">
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <button
                        type="submit"
                        className="btn !px-3 !py-2 text-[13px] border-2 border-line hover:border-ink"
                      >
                        <X size={15} weight="bold" />
                        {t("admin.review.reject")}
                      </button>
                    </form>
                  )}
                  <form
                    action={deleteAction}
                    className="inline ms-auto"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      void askConfirm({
                        title: t("admin.review.delTitle"),
                        message: t("admin.review.delMsg").replace("{n}", r.name),
                        confirmLabel: t("admin.table.delete"),
                        tone: "danger",
                      }).then((ok) => {
                        if (ok) form.requestSubmit();
                      });
                    }}
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      aria-label={t("admin.review.delAria").replace("{n}", r.name)}
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
        </>
      )}
    </div>
  );
}
