"use client";

import Link from "next/link";
import { FacebookLogo, InstagramLogo, TiktokLogo } from "@phosphor-icons/react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { useLang } from "@/components/providers";
import { SITE } from "@/lib/config";
import type { TKey } from "@/lib/i18n";

export function Footer() {
  const { lang, t } = useLang();

  const shopLinks: { key: TKey; href: string }[] = [
    { key: "nav.shop", href: "/shop" },
    { key: "nav.new", href: "/shop?sort=new" },
    { key: "nav.best", href: "/shop?sort=best" },
    { key: "nav.faq", href: "/faq" },
  ];
  const helpLinks: { key: TKey; href: string }[] = [
    { key: "footer.helpDelivery", href: "/faq" },
    { key: "footer.helpPay", href: "/faq" },
    { key: "footer.helpReturns", href: "/faq" },
    { key: "nav.contact", href: "/contact" },
  ];

  return (
    <footer className="bg-ink text-white mt-16 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 lg:px-6 pt-10 md:pt-14 pb-6 relative">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-9 items-start">
          <div>
            <span className="inline-block text-[11px] uppercase tracking-[0.16em] font-extrabold px-3 py-1 rounded-full bg-highlight text-ink">
              {t("footer.newsBadge")}
            </span>
            <p className="font-display text-[26px] md:text-[30px] font-bold leading-tight mt-3">
              {t("footer.newsTitle")}
            </p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-7">
            <div>
              <p className="font-display text-[16px] font-bold text-highlight">{t("footer.shop")}</p>
              <ul className="mt-3 space-y-1.5 text-[14px]">
                {shopLinks.map((l) => (
                  <li key={l.key}>
                    <Link href={l.href} className="inline-block py-1 text-white/75 hover:text-white">
                      {t(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-display text-[16px] font-bold text-highlight">{t("footer.help")}</p>
              <ul className="mt-3 space-y-1.5 text-[14px]">
                {helpLinks.map((l) => (
                  <li key={l.key}>
                    <Link href={l.href} className="inline-block py-1 text-white/75 hover:text-white">
                      {t(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-9 pt-6 border-t border-white/10">
          <div className="flex gap-2">
            <a
              href="#"
              aria-label="Instagram"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20"
            >
              <InstagramLogo size={20} />
            </a>
            <a
              href="#"
              aria-label="TikTok"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20"
            >
              <TiktokLogo size={20} />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20"
            >
              <FacebookLogo size={20} />
            </a>
          </div>
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-wa text-white text-[14px] font-bold border-2 border-white/10"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
            </svg>
            <span dir="ltr">+{SITE.whatsapp}</span>
          </a>
          <span className="text-[13px] text-white/60">
            {lang === "ar" ? SITE.city_ar : SITE.city} · {lang === "ar" ? SITE.hours_ar : SITE.hours}
          </span>
        </div>

        <p
          aria-hidden="true"
          className="font-display font-bold text-center mt-7 select-none leading-none text-white/[0.07] text-[19vw] lg:text-[150px]"
        >
          SAKINA
        </p>
      </div>

      <div className="border-t border-white/10 px-4 lg:px-6 py-3.5 mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-2 text-[12.5px] text-white/55">
        <span>{t("footer.rights")}</span>
        <div className="flex flex-wrap gap-4">
          <Link href="/faq" className="inline-block py-1.5">{t("footer.legal1")}</Link>
          <Link href="/faq" className="inline-block py-1.5">{t("footer.legal2")}</Link>
          <Link href="/faq" className="inline-block py-1.5">{t("footer.legal3")}</Link>
        </div>
      </div>
    </footer>
  );
}
