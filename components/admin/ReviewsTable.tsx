"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, MagnifyingGlass, PencilSimple, Star, Trash, X } from "@phosphor-icons/react";
import { deleteReview, deleteReviews, setReviewStatus, updateReview, type ActionState } from "@/app/admin/actions";
import { confirmSubmit, useConfirm } from "@/components/admin/Toast";
import { useActionToast } from "@/components/admin/useActionToast";
import { useLang } from "@/components/providers";
import type { ReviewRow, ReviewStatus } from "@/lib/db/reviews";

const STATUS_CLS: Record<ReviewStatus, string> = {
  pending: "bg-primary text-white",
  approved: "bg-teal-deep text-white",
  rejected: "border border-line text-ink-soft",
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
  // Pinned time zone: SSR and client must format identically or hydration
  // fails when the server process runs in UTC (Next dev) vs browser GMT+1.
  return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-MA" : "fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Casablanca",
  });
}

export function ReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);

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
  const [updateState, updateAction, updatePending] = useActionState<ActionState, FormData>(
    updateReview,
    {}
  );

  useActionToast(statusState);
  useActionToast(deleteState);
  useActionToast(bulkState);
  useActionToast(updateState);
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

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return reviews.filter((r) => {
      if (filter && r.status !== filter) return false;
      if (!needle) return true;
      return (
        r.name.toLowerCase().includes(needle) ||
        (r.city ?? "").toLowerCase().includes(needle) ||
        r.text.toLowerCase().includes(needle)
      );
    });
  }, [reviews, filter, query]);

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
      {/* Search */}
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
            placeholder={t("admin.table.searchReviews")}
            aria-label={t("admin.table.searchReviewAria")}
            className="field w-full ps-10 pe-3.5 py-2.5"
          />
        </div>
        <span className="text-[13px] text-ink-soft whitespace-nowrap">
          {rows.length} / {reviews.length}
        </span>
      </div>

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
          {query.trim() ? t("admin.table.noReviewMatch") : t("admin.review.noFilter")}
        </div>
      ) : (
        <>
          {bulkIds.length > 0 && (
            <form
              action={bulkAction}
              onSubmit={(e) =>
                confirmSubmit(e, askConfirm, {
                  title: t("admin.table.delReviewsTitle"),
                  message: t("admin.table.delReviewsMsg").replace("{n}", String(bulkIds.length)),
                  confirmLabel: t("admin.table.delete"),
                  tone: "danger",
                })
              }
              className="card px-4 py-3 flex flex-wrap items-center gap-3 !border-primary"
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

                {editingId === r.id ? (
                  <form
                    action={async (fd) => {
                      await updateAction(fd);
                      setEditingId(null);
                    }}
                    className="space-y-3 pt-2 border-t border-line anim-fade-in"
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[12px] font-bold text-ink-soft mb-1">
                          {t("form.name")} <span className="text-primary">*</span>
                        </label>
                        <input
                          name="name"
                          defaultValue={r.name}
                          required
                          className="field w-full px-3 py-2 text-[13.5px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-ink-soft mb-1">
                          {t("form.city")}
                        </label>
                        <input
                          name="city"
                          defaultValue={r.city ?? ""}
                          placeholder="Casablanca"
                          className="field w-full px-3 py-2 text-[13.5px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[12px] font-bold text-ink-soft mb-1">
                            {t("testi.rating")}
                          </label>
                          <select
                            name="rating"
                            defaultValue={r.rating}
                            className="field w-full px-2.5 py-2 text-[13.5px]"
                          >
                            <option value="5">5 ★★★★★</option>
                            <option value="4">4 ★★★★</option>
                            <option value="3">3 ★★★</option>
                            <option value="2">2 ★★</option>
                            <option value="1">1 ★</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[12px] font-bold text-ink-soft mb-1">
                            Statut
                          </label>
                          <select
                            name="status"
                            defaultValue={r.status}
                            className="field w-full px-2.5 py-2 text-[13.5px]"
                          >
                            <option value="approved">{t("admin.review.approved")}</option>
                            <option value="pending">{t("admin.dash.pending")}</option>
                            <option value="rejected">{t("admin.review.rejected")}</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-ink-soft mb-1">
                        {t("testi.comment")} <span className="text-primary">*</span>
                      </label>
                      <textarea
                        name="text"
                        rows={3}
                        defaultValue={r.text}
                        required
                        className="field w-full px-3 py-2 text-[13.5px] resize-y"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={updatePending}
                        className="btn btn-primary !px-3.5 !py-2 text-[13px] disabled:opacity-60"
                      >
                        <Check size={14} weight="bold" />
                        {updatePending ? "..." : t("admin.review.save")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="btn btn-outline !px-3.5 !py-2 text-[13px]"
                      >
                        {t("testi.cancel")}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-[14px] leading-relaxed bg-milk border border-line rounded-[10px] px-3.5 py-2.5">
                      {r.text}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(r.id)}
                        aria-label={`${t("admin.review.edit")} ${r.name}`}
                        className="btn !px-3 !py-2 text-[13px] border-2 border-line hover:border-ink inline-flex items-center gap-1.5"
                      >
                        <PencilSimple size={15} weight="bold" />
                        <span>{t("admin.review.edit")}</span>
                      </button>

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
                        onSubmit={(e) =>
                          confirmSubmit(e, askConfirm, {
                            title: t("admin.review.delTitle"),
                            message: t("admin.review.delMsg").replace("{n}", r.name),
                            confirmLabel: t("admin.table.delete"),
                            tone: "danger",
                          })
                        }
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
                  </>
                )}
              </li>
            );
          })}
        </ul>
        </>
      )}
    </div>
  );
}
