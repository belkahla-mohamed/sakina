"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, Star, Trash, X } from "@phosphor-icons/react";
import { deleteReview, setReviewStatus, type ActionState } from "@/app/admin/actions";
import { useConfirm } from "@/components/admin/Toast";
import { useActionToast } from "@/components/admin/useActionToast";
import type { ReviewRow, ReviewStatus } from "@/lib/db/reviews";

const STATUS_META: Record<ReviewStatus, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "bg-highlight text-ink" },
  approved: { label: "Approuvé", cls: "bg-teal-deep text-white" },
  rejected: { label: "Rejeté", cls: "bg-line text-ink-soft" },
};

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Toutes" },
  { value: "pending", label: "En attente" },
  { value: "approved", label: "Approuvés" },
  { value: "rejected", label: "Rejetés" },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
  const [filter, setFilter] = useState("");
  const [statusState, statusAction] = useActionState<ActionState, FormData>(
    setReviewStatus,
    {}
  );
  const [deleteState, deleteAction] = useActionState<ActionState, FormData>(
    deleteReview,
    {}
  );
  useActionToast(statusState);
  useActionToast(deleteState);
  const askConfirm = useConfirm();

  const counts = useMemo(() => {
    const m: Record<string, number> = { "": reviews.length };
    for (const r of reviews) m[r.status] = (m[r.status] ?? 0) + 1;
    return m;
  }, [reviews]);

  const rows = useMemo(
    () => (filter ? reviews.filter((r) => r.status === filter) : reviews),
    [reviews, filter]
  );

  if (reviews.length === 0) {
    return (
      <div className="card p-12 text-center text-[14.5px] text-ink-soft">
        Aucun avis pour le moment.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
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
              {f.label}
              <span className={`ms-1.5 ${active ? "opacity-70" : "text-ink-soft"}`}>
                {counts[f.value] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="card p-10 text-center text-[14.5px] text-ink-soft">
          Aucun avis dans ce filtre.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const meta = STATUS_META[r.status] ?? STATUS_META.pending;
            return (
              <li key={r.id} className="card p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-highlight/40 border border-line flex items-center justify-center font-display font-bold text-[15px] shrink-0">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-bold text-[14.5px] leading-tight">{r.name}</p>
                      <p className="text-[12.5px] text-ink-soft">
                        {r.city ? `${r.city} · ` : ""}
                        {formatDate(r.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-0.5" aria-label={`${r.rating} sur 5`}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={15}
                          weight={i <= r.rating ? "fill" : "regular"}
                          className={i <= r.rating ? "text-highlight" : "text-line"}
                        />
                      ))}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${meta.cls}`}>
                      {meta.label}
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
                        Approuver
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
                        Rejeter
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
                        title: "Supprimer cet avis ?",
                        message: `L'avis de ${r.name} sera définitivement effacé.`,
                        confirmLabel: "Supprimer",
                        tone: "danger",
                      }).then((ok) => {
                        if (ok) form.requestSubmit();
                      });
                    }}
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      aria-label={`Supprimer l'avis de ${r.name}`}
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
      )}
    </div>
  );
}
