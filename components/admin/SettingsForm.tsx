"use client";

import { useActionState } from "react";
import { Info, WhatsappLogo } from "@phosphor-icons/react";
import { saveSettings, type ActionState } from "@/app/admin/actions";
import { useActionToast } from "@/components/admin/useActionToast";
import type { SettingsMap } from "@/lib/db/settings";

export function SettingsForm({ settings }: { settings: SettingsMap }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveSettings,
    {}
  );
  useActionToast(state);

  const label = "block text-[13.5px] font-bold mb-1.5";
  const hint = "text-[12px] text-ink-soft mt-1.5";
  const field = "field w-full px-3.5 py-2.5";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Contact */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold flex items-center gap-2">
          <WhatsappLogo size={18} weight="fill" className="text-wa" />
          Contact & livraison
        </h2>

        <div>
          <label htmlFor="whatsapp" className={label}>
            Numéro WhatsApp (format international, sans +)
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            inputMode="tel"
            placeholder="2126XXXXXXXX"
            defaultValue={settings.whatsapp ?? ""}
            className={`${field} font-mono`}
          />
          <p className={hint}>
            Utilisé par tous les boutons &laquo;&nbsp;WhatsApp&nbsp;&raquo; de la
            boutique et par le lien du pied de page.
          </p>
        </div>

        <div>
          <label htmlFor="free_shipping_from" className={label}>
            Livraison offerte à partir de (DH)
          </label>
          <input
            id="free_shipping_from"
            name="free_shipping_from"
            type="number"
            min="0"
            step="1"
            placeholder="300"
            defaultValue={settings.free_shipping_from ?? ""}
            className={`${field} max-w-[220px]`}
          />
          <p className={hint}>
            En dessous de ce montant, les frais de port sont de 30 DH.
          </p>
        </div>
      </section>

      {/* Announcement bar */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">Bandeau d&apos;annonce</h2>
        <div>
          <label htmlFor="announce_fr" className={label}>
            Texte (FR)
          </label>
          <input
            id="announce_fr"
            name="announce_fr"
            defaultValue={settings.announce_fr ?? ""}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="announce_ar" className={label}>
            Texte (AR)
          </label>
          <input
            id="announce_ar"
            name="announce_ar"
            dir="rtl"
            defaultValue={settings.announce_ar ?? ""}
            className={`${field} ar`}
          />
        </div>
      </section>

      {/* Branding */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">Identité de la boutique</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="site_name" className={label}>
              Nom (FR)
            </label>
            <input
              id="site_name"
              name="site_name"
              defaultValue={settings.site_name ?? ""}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="site_name_ar" className={label}>
              Nom (AR)
            </label>
            <input
              id="site_name_ar"
              name="site_name_ar"
              dir="rtl"
              defaultValue={settings.site_name_ar ?? ""}
              className={`${field} ar`}
            />
          </div>
        </div>
      </section>

      <div className="flex items-start gap-2.5 text-[13px] text-ink-soft bg-milk border border-line rounded-[12px] px-4 py-3">
        <Info size={17} className="shrink-0 mt-0.5" />
        <p>
          Laissez un champ vide pour revenir à la valeur par défaut. Les
          modifications s&apos;appliquent immédiatement à toute la boutique.
        </p>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer les réglages"}
      </button>
    </form>
  );
}
