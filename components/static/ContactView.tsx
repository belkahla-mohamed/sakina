"use client";

import { useState } from "react";
import {
  EnvelopeSimple,
  MapPin,
  Clock,
  Phone,
  InstagramLogo,
  FacebookLogo,
  TiktokLogo,
} from "@phosphor-icons/react";
import { useLang, useSettings } from "@/components/providers";
import { WaIcon } from "@/components/WaIcon";
import { SITE } from "@/lib/config";
import { openWhatsApp, whatsappLink } from "@/lib/whatsapp";

export function ContactView() {
  const { lang, t } = useLang();
  const settings = useSettings();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = { name: !name.trim(), phone: !phone.trim(), message: !message.trim() };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const text = lang === "ar"
      ? `مرحبًا ساكينا،\n${message}\n\nالاسم: ${name}\nالهاتف: ${phone}`
      : `Bonjour Sakina,\n${message}\n\nNom : ${name}\nTél : ${phone}`;
    openWhatsApp(text, settings.whatsapp);
  }

  const rows = [
    { icon: Clock, label: t("contact.hours"), value: lang === "ar" ? SITE.hours_ar : SITE.hours, ltr: false },
    { icon: MapPin, label: lang === "ar" ? "المدينة" : "Ville", value: lang === "ar" ? SITE.city_ar : SITE.city, ltr: false },
    { icon: Phone, label: lang === "ar" ? "الهاتف" : "Téléphone", value: `+${settings.whatsapp}`, ltr: true },
    { icon: EnvelopeSimple, label: "Email", value: SITE.email, ltr: true },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-6 py-10 md:py-16 anim-fade-up">
      <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-primary">
        {t("nav.contact")}
      </p>
      <h1 className="text-[32px] md:text-[44px] font-bold mt-2">{t("contact.title")}</h1>
      <p className="text-[17px] text-ink-soft mt-3 max-w-2xl">{t("contact.lead")}</p>

      <div className="grid md:grid-cols-[1fr_1.2fr] gap-6 mt-8 items-start">
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            {rows.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-highlight border-2 border-ink flex items-center justify-center shrink-0">
                    <Icon size={18} weight="bold" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] text-ink-soft font-bold uppercase tracking-wide">
                      {r.label}
                    </p>
                    <p className="text-[15px] font-bold truncate">
                      {r.ltr ? <span dir="ltr">{r.value}</span> : r.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card p-5" style={{ background: "var(--color-teal)", borderColor: "var(--color-ink)", color: "#fff" }}>
            <p className="font-display font-bold text-[17px]">{t("contact.or")}</p>
            <a
              href={whatsappLink(undefined, settings.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-wa w-full mt-3"
            >
              <WaIcon size={20} />
              {t("wa.cta")}
            </a>
            <div className="flex gap-2 mt-4">
              {[InstagramLogo, TiktokLogo, FacebookLogo].map((Icon, i) => (
                <span key={i} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                  <Icon size={18} />
                </span>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="card p-5 md:p-6 space-y-4" noValidate>
          <div>
            <label htmlFor="c-name" className="block text-[13.5px] font-bold mb-1.5">
              {t("form.name")} <span className="text-primary">*</span>
            </label>
            <input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="field w-full px-4 py-3 outline-none focus:border-ink"
              data-error={errors.name ? "true" : undefined}
            />
            {errors.name && (
              <p className="text-[12.5px] text-primary font-bold mt-1 anim-fade-in">{t("form.required")}</p>
            )}
          </div>

          <div>
            <label htmlFor="c-phone" className="block text-[13.5px] font-bold mb-1.5">
              {t("form.phone")} <span className="text-primary">*</span>
            </label>
            <input
              id="c-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className="field w-full px-4 py-3 outline-none focus:border-ink"
              data-error={errors.phone ? "true" : undefined}
            />
            {errors.phone && (
              <p className="text-[12.5px] text-primary font-bold mt-1 anim-fade-in">{t("form.required")}</p>
            )}
          </div>

          <div>
            <label htmlFor="c-msg" className="block text-[13.5px] font-bold mb-1.5">
              {t("contact.message")} <span className="text-primary">*</span>
            </label>
            <textarea
              id="c-msg"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="field w-full px-4 py-3 outline-none focus:border-ink resize-y"
              data-error={errors.message ? "true" : undefined}
            />
            {errors.message && (
              <p className="text-[12.5px] text-primary font-bold mt-1 anim-fade-in">{t("form.required")}</p>
            )}
          </div>

          <button type="submit" className="btn btn-wa w-full">
            <WaIcon size={20} />
            {t("contact.send")}
          </button>
        </form>
      </div>
    </div>
  );
}
