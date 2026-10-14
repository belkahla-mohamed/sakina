"use client";

import Link from "next/link";
import { Lightbulb, Truck, ShieldCheck } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";

const VALUES = [
  { icon: Lightbulb, t: "about.v1", s: "about.v1s", bg: "bg-sand", fg: "text-brick" },
  { icon: Truck, t: "about.v2", s: "about.v2s", bg: "bg-sand", fg: "text-brick" },
  { icon: ShieldCheck, t: "about.v3", s: "about.v3s", bg: "bg-sand", fg: "text-brick" },
] as const;

export function AboutView() {
  const { t } = useLang();

  return (
    <div className="mx-auto max-w-6xl px-4 lg:px-6 py-10 md:py-16 anim-fade-up">
      <p className="eyebrow">
        {t("home.heroBadge")}
      </p>
      <h1 className="text-[32px] md:text-[44px] font-bold mt-3 max-w-2xl leading-[1.06]">
        {t("about.title")}
      </h1>
      <p className="text-[18px] md:text-[20px] text-ink-soft mt-3 max-w-2xl">{t("about.lead")}</p>

      <div
        className="card p-6 md:p-9 mt-8"
        style={{ background: "#f4f0e6", borderColor: "rgba(42,29,22,0.10)" }}
      >
        <p className="text-[16.5px] leading-relaxed max-w-3xl">{t("about.p1")}</p>
        <p className="text-[16.5px] leading-relaxed max-w-3xl mt-4">{t("about.p2")}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-8">
        {VALUES.map((v) => {
          const Icon = v.icon;
          return (
            <div key={v.t} className="card p-6">
              <span
                className={`w-12 h-12 rounded-full flex items-center justify-center ${v.bg} ${v.fg}`}
              >
                <Icon size={24} weight="bold" />
              </span>
              <p className="font-display font-bold text-[18px] mt-3">{t(v.t)}</p>
              <p className="text-[14.5px] text-ink-soft mt-1.5 leading-relaxed">{t(v.s)}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <Link href="/shop" className="btn btn-primary">
          {t("home.heroCta")}
        </Link>
      </div>
    </div>
  );
}
