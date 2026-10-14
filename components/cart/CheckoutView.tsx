"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle } from "@phosphor-icons/react";
import { useCart, useLang, useSettings } from "@/components/providers";
import { formatPrice } from "@/lib/i18n";
import {
  buildLines,
  buildOrderMessage,
  computeTotals,
  openWhatsApp,
  whatsappLink,
} from "@/lib/whatsapp";
import { WaIcon } from "@/components/WaIcon";
import { placeOrder } from "@/app/(store)/checkout/actions";
import type { Product } from "@/lib/types";

const CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "El Jadida",
];

export function CheckoutView({ products }: { products: Product[] }) {
  const { lang, t } = useLang();
  const settings = useSettings();
  const { entries, clear } = useCart();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [waWeb, setWaWeb] = useState<string | null>(null);

  const lines = buildLines(entries, products);
  const totals = computeTotals(lines, settings.freeShippingFrom);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 lg:px-6 py-16 text-center">
        <div className="card p-10 anim-fade-up">
          <p className="font-display text-[24px] font-bold">{t("cart.empty")}</p>
          <Link href="/shop" className="btn btn-primary mt-5 inline-flex">
            {t("cart.back")}
          </Link>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = {
      name: !name.trim(),
      phone: !phone.trim(),
      city: !city.trim(),
      address: !address.trim(),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSending(true);
    const result = await placeOrder({
      customer: { name, phone, city, address },
      items: lines.map((l) => ({ slug: l.product.slug, qty: l.qty })),
    });
    setSending(false);

    if (!result.ok) {
      setOrderError(result.error ?? "Une erreur est survenue.");
      return;
    }
    setOrderError(null);

    const message = buildOrderMessage(lines, totals, { name, phone, city, address });
    const withRef = `${message}\n\nRéf : ${result.reference}`;
    setWaWeb(whatsappLink(withRef, settings.whatsapp));
    openWhatsApp(withRef, settings.whatsapp);
    setSent(true);
  }

  const field = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    type = "text",
    autoComplete?: string
  ) => (
    <div>
      <label htmlFor={id} className="block text-[13.5px] font-bold mb-1.5">
        {label} <span className="text-primary">*</span>
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="field w-full px-4 py-3 outline-none focus:border-ink"
        data-error={errors[id] ? "true" : undefined}
      />
      {errors[id] && (
        <p className="text-[12.5px] text-primary font-bold mt-1 anim-fade-in">{t("form.required")}</p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-6 py-8 md:py-12 anim-fade-up">
      <h1 className="text-[30px] md:text-[38px] font-bold">{t("order.title")}</h1>

      {sent && (
        <div
          className="mt-6 p-5 rounded-[10px] border border-line flex flex-col sm:flex-row sm:items-center gap-4 anim-fade-up"
          style={{ background: "#E9FBF3", borderColor: "#1FDA25" }}
        >
          <CheckCircle size={38} weight="fill" className="text-wa shrink-0" />
          <div className="flex-1">
            <p className="font-display font-bold text-[17px]">
              {lang === "ar"
                ? "تم فتح واتساب. أرسل الرسالة لإتمام الطلب."
                : "WhatsApp s'est ouvert. Envoyez le message pour confirmer."}
            </p>
            <p className="text-[14px] text-ink-soft">
              {lang === "ar"
                ? "بعد الإرسال، يمكنك تفريغ السلة والمتابعة."
                : "Une fois envoyé, vous pouvez vider le panier et continuer."}
            </p>
          </div>
          {waWeb && (
            <a href={waWeb} target="_blank" rel="noopener noreferrer" className="btn btn-wa shrink-0">
              <WaIcon size={18} />
              {lang === "ar" ? "إعادة فتح واتساب" : "Rouvrir WhatsApp"}
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              clear();
              setSent(false);
            }}
            className="btn btn-outline shrink-0"
          >
            {lang === "ar" ? "تفريغ السلة" : "Vider le panier"}
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-6 mt-6 items-start">
        <form onSubmit={submit} className="card min-w-0 p-5 md:p-6 space-y-4" noValidate>
          <p className="font-display text-[19px] font-bold">
            {lang === "ar" ? "معلوماتك" : "Vos coordonnées"}
          </p>

          {field("name", t("form.name"), name, setName, "text", "name")}
          <div className="grid sm:grid-cols-2 gap-4">
            {field("phone", t("form.phone"), phone, setPhone, "tel", "tel")}
            <div>
              <label htmlFor="city" className="block text-[13.5px] font-bold mb-1.5">
                {t("form.city")} <span className="text-primary">*</span>
              </label>
              <input
                id="city"
                list="cities"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
                className="field w-full px-4 py-3 outline-none focus:border-ink"
                data-error={errors.city ? "true" : undefined}
              />
              <datalist id="cities">
                {CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {errors.city && (
                <p className="text-[12.5px] text-primary font-bold mt-1 anim-fade-in">{t("form.required")}</p>
              )}
            </div>
          </div>

          {field("address", t("form.address"), address, setAddress, "text", "street-address")}

          {orderError && (
            <p
              role="alert"
              className="text-[13.5px] font-bold text-primary bg-primary/10 border border-primary/40 rounded-[8px] px-3.5 py-2.5"
            >
              {orderError}
            </p>
          )}

          <button type="submit" className="btn btn-wa w-full" disabled={sending}>
            <WaIcon size={21} />
            {sending
              ? lang === "ar"
                ? "جارٍ التسجيل…"
                : "Enregistrement…"
              : t("order.send")}
          </button>
          <p className="text-[13px] text-ink-soft text-center">{t("order.needInfo")}</p>
        </form>

        <div className="card min-w-0 p-5 sticky top-24">
          <p className="font-display text-[19px] font-bold">{t("order.recap")}</p>

          <ul className="mt-4 space-y-3">
            {lines.map(({ product, qty }) => (
              <li key={product.slug} className="flex gap-3 items-center">
                <div className="relative w-14 h-12 rounded-[10px] overflow-hidden bg-highlight/30 shrink-0">
                  <Image
                    src={product.image}
                    alt={lang === "ar" ? product.name_ar : product.name_fr}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-bold truncate">
                    {lang === "ar" ? product.name_ar : product.name_fr}
                  </p>
                  <p className="text-[12px] text-ink-soft">
                    {qty} × {formatPrice(product.price, lang)}
                  </p>
                </div>
                <span className="price text-[14px]">
                  {formatPrice(product.price * qty, lang)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t-2 border-line space-y-2 text-[15px]">
            <div className="flex justify-between">
              <span className="text-ink-soft">{t("cart.subtotal")}</span>
              <span className="price">{formatPrice(totals.subtotal, lang)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">{t("cart.shipping")}</span>
              <span className="price">
                {totals.shipping === 0 ? t("cart.free") : formatPrice(totals.shipping, lang)}
              </span>
            </div>
            <div className="flex justify-between border-t-2 border-line pt-3 text-[18px]">
              <span className="font-bold">{t("cart.total")}</span>
              <span className="price text-primary">{formatPrice(totals.total, lang)}</span>
            </div>
          </div>

          <p className="text-[12.5px] mt-4 text-ink-soft leading-relaxed">
            {lang === "ar"
              ? "عند الضغط على الزر، تُفتح واتساب برسالة جاهزة تحتوي على طلبك ومعلوماتك — بالعربية ثم بالفرنسية."
              : "Au clic, WhatsApp s'ouvre avec un message tout prêt (votre commande + vos coordonnées), d'abord en arabe puis en français."}
          </p>
        </div>
      </div>
    </div>
  );
}
