"use client";

import { useActionState } from "react";
import { Info, WhatsappLogo } from "@phosphor-icons/react";
import { saveSettings, type ActionState } from "@/app/admin/actions";
import { useActionToast } from "@/components/admin/useActionToast";
import { useLang } from "@/components/providers";
import type { SettingsMap } from "@/lib/db/settings";

export function SettingsForm({ settings }: { settings: SettingsMap }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    saveSettings,
    {}
  );
  useActionToast(state);
  const { t } = useLang();

  const label = "block text-[13.5px] font-bold mb-1.5";
  const hint = "text-[12px] text-ink-soft mt-1.5";
  const field = "field w-full px-3.5 py-2.5";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Contact */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold flex items-center gap-2">
          <WhatsappLogo size={18} weight="fill" className="text-wa" />
          {t("admin.settings.contact")}
        </h2>

        <div>
          <label htmlFor="whatsapp" className={label}>
            {t("admin.settings.whatsappLabel")}
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
            {t("admin.settings.whatsappHint")}
          </p>
        </div>

        <div>
          <label htmlFor="free_shipping_from" className={label}>
            {t("admin.settings.shipFree")}
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
            {t("admin.settings.shipHint")}
          </p>
        </div>
      </section>

      {/* Socials */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">{t("admin.settings.social")}</h2>
        <div>
          <label htmlFor="social_instagram" className={label}>
            Instagram
          </label>
          <input
            id="social_instagram"
            name="social_instagram"
            type="url"
            inputMode="url"
            dir="ltr"
            placeholder="https://instagram.com/…"
            defaultValue={settings.social_instagram ?? ""}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="social_tiktok" className={label}>
            TikTok
          </label>
          <input
            id="social_tiktok"
            name="social_tiktok"
            type="url"
            inputMode="url"
            dir="ltr"
            placeholder="https://tiktok.com/@…"
            defaultValue={settings.social_tiktok ?? ""}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="social_facebook" className={label}>
            Facebook
          </label>
          <input
            id="social_facebook"
            name="social_facebook"
            type="url"
            inputMode="url"
            dir="ltr"
            placeholder="https://facebook.com/…"
            defaultValue={settings.social_facebook ?? ""}
            className={field}
          />
        </div>
        <p className={hint}>
          {t("admin.settings.socialHint")}
        </p>
      </section>

      {/* Announcement bar */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">{t("admin.settings.announce")}</h2>
        <div>
          <label htmlFor="announce_fr" className={label}>
            {t("admin.settings.textFr")}
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
            {t("admin.settings.textAr")}
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
        <h2 className="font-display text-[17px] font-bold">{t("admin.settings.branding")}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="site_name" className={label}>
              {t("admin.form.nameFr")}
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
              {t("admin.form.nameAr")}
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

      {/* Appearance */}
      <section className="card p-5 space-y-4">
        <h2 className="font-display text-[17px] font-bold">{t("admin.settings.appearance")}</h2>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" name="product_rotation" value="1" defaultChecked={settings.product_rotation !== "0"} className="w-4.5 h-4.5 accent-primary mt-0.5" />
          <input type="hidden" name="product_rotation" value="0" />
          <span>
            <span className="block text-[13.5px] font-bold">{t("admin.settings.rotation")}</span>
            <span className={hint}>{t("admin.settings.rotationHint")}</span>
          </span>
        </label>
      </section>

      <div className="flex items-start gap-2.5 text-[13px] text-ink-soft bg-milk border border-line rounded-[12px] px-4 py-3">
        <Info size={17} className="shrink-0 mt-0.5" />
        <p>
          {t("admin.settings.note")}
        </p>
      </div>

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? t("admin.form.pending") : t("admin.settings.save")}
      </button>
    </form>
  );
}
