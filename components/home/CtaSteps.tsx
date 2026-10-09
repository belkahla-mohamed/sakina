"use client";

import { ChatCircleDots, MapPin, Package } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";
import { WaIcon } from "@/components/WaIcon";
import { SITE } from "@/lib/config";

const STEPS = [
  { icon: ChatCircleDots, n: "1", title: "home.ctaStep1", sub: "home.ctaStep1s", color: "#E8457F", numBg: "#E8457F" },
  { icon: MapPin, n: "2", title: "home.ctaStep2", sub: "home.ctaStep2s", color: "#E0A800", numBg: "#E0A800" },
  { icon: Package, n: "3", title: "home.ctaStep3", sub: "home.ctaStep3s", color: "#1B9A8E", numBg: "#1B9A8E" },
] as const;

export function CtaSteps() {
  const { t } = useLang();

  return (
    <section className="mx-auto max-w-6xl px-4 lg:px-6 py-10 md:py-14 anim-reveal">
      <div className="card p-6 md:p-11">
        <div className="text-center max-w-2xl mx-auto mb-9">
          <span className="inline-block bg-highlight border-2 border-ink rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider">
            {t("home.ctaBadge")}
          </span>
          <h2 className="text-[28px] md:text-[36px] font-bold mt-4">{t("home.ctaTitle")}</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="relative border-2 border-line rounded-[18px] bg-white pt-6 pb-5 px-5"
                style={{ borderTop: `6px solid ${s.color}` }}
              >
                <span
                  className="absolute -top-4 start-4 w-[34px] h-[34px] rounded-full flex items-center justify-center font-display font-bold text-white border-2 border-ink"
                  style={{ background: s.numBg }}
                >
                  {s.n}
                </span>
                <Icon size={30} style={{ color: s.color }} />
                <p className="font-display text-[18px] font-bold mt-2.5">{t(s.title)}</p>
                <p className="text-[14px] mt-1.5 text-ink-soft leading-relaxed">{t(s.sub)}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <a
            href={`https://wa.me/${SITE.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wa"
          >
            <WaIcon size={22} />
            {t("home.ctaBtn")}
          </a>
        </div>
      </div>
    </section>
  );
}
