"use client";

import { useActionState, useMemo, useState } from "react";
import { MapPin, Note, Phone, WhatsappLogo } from "@phosphor-icons/react";
import { saveOrderNote, setOrderStatus, type ActionState } from "@/app/admin/actions";
import { useActionToast } from "@/components/admin/useActionToast";
import type { OrderRow, OrderStatus } from "@/lib/db/orders";

const STATUS_META: Record<OrderStatus, { label: string; cls: string }> = {
  nouvelle: { label: "Nouvelle", cls: "bg-primary text-white" },
  en_cours: { label: "En cours", cls: "bg-highlight text-ink" },
  livree: { label: "Livrée", cls: "bg-teal-deep text-white" },
  annulee: { label: "Annulée", cls: "bg-line text-ink-soft" },
};

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Toutes" },
  { value: "nouvelle", label: "Nouvelles" },
  { value: "en_cours", label: "En cours" },
  { value: "livree", label: "Livrées" },
  { value: "annulee", label: "Annulées" },
];

function formatPrice(n: number): string {
  return `${n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ")} dh`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", {
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
        Aucune commande pour le moment.
        <p className="mt-2 text-[13px]">
          Les commandes passées via WhatsApp apparaîtront ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status tabs */}
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
          Aucune commande dans ce filtre.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((o) => {
            const meta = STATUS_META[o.status] ?? STATUS_META.nouvelle;
            const expanded = open.has(o.id);
            return (
              <li key={o.id} className="card p-4 space-y-3.5">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono font-bold text-[15px]">{o.reference}</p>
                    <p className="text-[12.5px] text-ink-soft mt-0.5">
                      {formatDate(o.created_at)} ·{" "}
                      {(o.items ?? []).reduce((s, it) => s + it.qty, 0)} article(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-bold ${meta.cls}`}>
                      {meta.label}
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
                    Détail de la commande
                  </span>
                  <span aria-hidden>{expanded ? "−" : "+"}</span>
                </button>

                {expanded && (
                  <div className="space-y-3">
                    <ul className="divide-y divide-line text-[13.5px]">
                      {(o.items ?? []).map((it) => (
                        <li key={it.id} className="py-2 flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate">
                            <span className="font-bold">{it.qty}×</span> {it.name_fr}
                          </span>
                          <span className="price text-[13.5px] shrink-0">
                            {formatPrice(Number(it.price) * it.qty)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <dl className="text-[13.5px] space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-ink-soft">Sous-total</dt>
                        <dd>{formatPrice(Number(o.subtotal))}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-ink-soft">Livraison</dt>
                        <dd>{Number(o.shipping) === 0 ? "Offerte" : formatPrice(Number(o.shipping))}</dd>
                      </div>
                      <div className="flex justify-between font-bold border-t border-line pt-1.5">
                        <dt>Total</dt>
                        <dd className="price">{formatPrice(Number(o.total))}</dd>
                      </div>
                    </dl>

                    {/* Actions */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <form action={statusAction} className="space-y-1.5">
                        <input type="hidden" name="id" value={o.id} />
                        <label htmlFor={`status-${o.id}`} className="block text-[12.5px] font-bold">
                          Statut
                        </label>
                        <div className="flex gap-2">
                          <select
                            id={`status-${o.id}`}
                            name="status"
                            defaultValue={o.status}
                            className="field flex-1 px-3 py-2 text-[13.5px]"
                          >
                            {(Object.keys(STATUS_META) as OrderStatus[]).map((s) => (
                              <option key={s} value={s}>
                                {STATUS_META[s].label}
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
                          Note interne
                        </label>
                        <div className="flex gap-2">
                          <input
                            id={`note-${o.id}`}
                            name="note"
                            defaultValue={o.note ?? ""}
                            placeholder="Ex. appelé, en attente…"
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
                        <span className="font-bold">Note :</span> {o.note}
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
