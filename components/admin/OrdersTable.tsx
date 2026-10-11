"use client";

import { useActionState, useMemo, useState } from "react";
import { MapPin, Note, Phone, WhatsappLogo } from "@phosphor-icons/react";
import { saveOrderNote, setOrderStatus, type ActionState } from "@/app/admin/actions";
import { useActionToast } from "@/components/admin/useActionToast";
import { useLang } from "@/components/providers";
import type { OrderRow, OrderStatus } from "@/lib/db/orders";

const STATUS_CLS: Record<OrderStatus, string> = {
  nouvelle: "bg-primary text-white",
  en_cours: "bg-highlight text-ink",
  livree: "bg-teal-deep text-white",
  annulee: "bg-line text-ink-soft",
};

const STATUS_KEY = {
  nouvelle: "admin.order.statusNew",
  en_cours: "admin.order.statusProgress",
  livree: "admin.order.statusDone",
  annulee: "admin.order.statusCancelled",
} as const;

const FILTER_KEYS = [
  { value: "", key: "admin.table.all" },
  { value: "nouvelle", key: "admin.order.filterNew" },
  { value: "en_cours", key: "admin.order.statusProgress" },
  { value: "livree", key: "admin.order.filterDone" },
  { value: "annulee", key: "admin.order.filterCancelled" },
] as const;

function formatPrice(n: number): string {
  return `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ")} dh`;
}

function formatDate(iso: string, lang: "fr" | "ar"): string {
  return new Date(iso).toLocaleString(lang === "ar" ? "ar-MA" : "fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function waLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState<Set<number>>(() => new Set(orders.slice(0, 3).map((o) => o.id)));
  const { t, lang } = useLang();
  const [statusState, statusAction] = useActionState<ActionState, FormData>(
    setOrderStatus,
    {}
  );
  const [noteState, noteAction] = useActionState<ActionState, FormData>(
    saveOrderNote,
    {}
  );
  useActionToast(statusState);
  useActionToast(noteState);

  const counts = useMemo(() => {
    const m: Record<string, number> = { "": orders.length };
    for (const o of orders) m[o.status] = (m[o.status] ?? 0) + 1;
    return m;
  }, [orders]);

  const rows = useMemo(
    () => (filter ? orders.filter((o) => o.status === filter) : orders),
    [orders, filter]
  );

  function toggle(id: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (orders.length === 0) {
    return (
      <div className="card p-12 text-center text-[14.5px] text-ink-soft">
        {t("admin.dash.noOrders")}
        <p className="mt-2 text-[13px]">
          {t("admin.order.noneSub")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
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
          {t("admin.order.noFilter")}
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((o) => {
            const cls = STATUS_CLS[o.status] ?? STATUS_CLS.nouvelle;
            const sk = STATUS_KEY[o.status as keyof typeof STATUS_KEY];
            const expanded = open.has(o.id);
            return (
              <li key={o.id} className="card p-4 space-y-3.5">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono font-bold text-[15px]">{o.reference}</p>
                    <p className="text-[12.5px] text-ink-soft mt-0.5">
                      {formatDate(o.created_at, lang)} ·{" "}
                      {(o.items ?? []).reduce((s, it) => s + it.qty, 0)} {t("admin.order.items")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${cls}`}>
                      {sk ? t(sk) : o.status}
                    </span>
                    <span className="price text-[16px]">{formatPrice(Number(o.total))}</span>
                  </div>
                </div>

                {/* Customer */}
                <div className="grid sm:grid-cols-2 gap-3 text-[13.5px]">
                  <div>
                    <p className="font-bold">{o.customer_name}</p>
                    <p className="text-ink-soft flex items-start gap-1.5 mt-1">
                      <MapPin size={15} className="shrink-0 mt-0.5" />
                      {o.customer_city} — {o.customer_address}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-start gap-2 sm:justify-end">
                    <a
                      href={`tel:${o.customer_phone}`}
                      className="btn btn-outline !px-3 !py-2 text-[13px]"
                    >
                      <Phone size={14} weight="bold" />
                      {o.customer_phone}
                    </a>
                    <a
                      href={waLink(o.customer_phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn !px-3 !py-2 text-[13px] bg-wa text-white hover:opacity-90"
                    >
                      <WhatsappLogo size={14} weight="fill" />
                      WhatsApp
                    </a>
                  </div>
                </div>

                {/* Items */}
                <button
                  type="button"
                  onClick={() => toggle(o.id)}
                  aria-expanded={expanded}
                  className="w-full flex items-center justify-between text-[13px] font-bold text-ink-soft hover:text-ink py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Note size={15} weight="bold" />
                    {t("admin.order.detail")}
                  </span>
                  <span aria-hidden>{expanded ? "−" : "+"}</span>
                </button>

                {expanded && (
                  <div className="space-y-3">
                    <ul className="divide-y divide-line text-[13.5px]">
                      {(o.items ?? []).map((it) => (
                        <li key={it.id} className="py-2 flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate">
                            <span className="font-bold">{it.qty}×</span> {lang === "ar" ? it.name_ar : it.name_fr}
                          </span>
                          <span className="price text-[13.5px] shrink-0">
                            {formatPrice(Number(it.price) * it.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <dl className="text-[13.5px] space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-ink-soft">{t("cart.subtotal")}</dt>
                        <dd>{formatPrice(Number(o.subtotal))}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-soft">{t("cart.shipping")}</dt>
                        <dd>{Number(o.shipping) === 0 ? t("admin.order.freeShip") : formatPrice(Number(o.shipping))}</dd>
                      </div>
                      <div className="flex justify-between font-bold border-t border-line pt-1.5">
                        <dt>{t("cart.total")}</dt>
                        <dd className="price">{formatPrice(Number(o.total))}</dd>
                      </div>
                    </dl>

                    {/* Actions */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <form action={statusAction} className="space-y-1.5">
                        <input type="hidden" name="id" value={o.id} />
                        <label htmlFor={`status-${o.id}`} className="block text-[12.5px] font-bold">
                          {t("admin.order.status")}
                        </label>
                        <div className="flex gap-2">
                          <select
                            id={`status-${o.id}`}
                            name="status"
                            defaultValue={o.status}
                            className="field flex-1 px-3 py-2 text-[13.5px]"
                          >
                            {(Object.keys(STATUS_CLS) as OrderStatus[]).map((s) => (
                              <option key={s} value={s}>
                                {t(STATUS_KEY[s])}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="btn btn-outline !px-3 !py-2 text-[13px]">
                            OK
                          </button>
                        </div>
                      </form>

                      <form action={noteAction} className="space-y-1.5">
                        <input type="hidden" name="id" value={o.id} />
                        <label htmlFor={`note-${o.id}`} className="block text-[12.5px] font-bold">
                          {t("admin.order.noteLabel")}
                        </label>
                        <div className="flex gap-2">
                          <input
                            id={`note-${o.id}`}
                            name="note"
                            defaultValue={o.note ?? ""}
                            placeholder={t("admin.order.notePh")}
                            className="field flex-1 px-3 py-2 text-[13.5px]"
                          />
                          <button type="submit" className="btn btn-outline !px-3 !py-2 text-[13px]">
                            OK
                          </button>
                        </div>
                      </form>
                    </div>

                    {o.note && (
                      <p className="text-[12.5px] text-ink-soft bg-milk rounded-[10px] border border-line px-3 py-2">
                        <span className="font-bold">{t("admin.order.noteIs")}</span> {o.note}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
