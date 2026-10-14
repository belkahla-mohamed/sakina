"use client";

import { Truck, Wallet, ArrowCounterClockwise, Star } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";

const ITEMS = [
  { icon: Truck, title: "home.trust1", sub: "home.trust1s" },
  { icon: Wallet, title: "home.trust2", sub: "home.trust2s" },
  { icon: ArrowCounterClockwise, title: "home.trust3", sub: "home.trust3s" },
  { icon: Star, title: "home.trust4", sub: "home.trust4s" },
] as const;

export function TrustStrip() {
  const { t } = useLang();
  return (
    <section className="bg-white border-b border-line anim-reveal">
      <div className="mx-auto max-w-6xl px-4 lg:px-6 grid grid-cols-2 lg:grid-cols-4 divide-x divide-line rtl:divide-x-reverse">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-center gap-3 py-5 px-2 lg:px-5">
              <span className="w-11 h-11 rounded-full bg-highlight/20 text-primary flex items-center justify-center shrink-0">
                <Icon size={20} weight="bold" />
              </span>
              <div className="min-w-0">
                <p className="font-display font-bold text-[14.5px] leading-tight">{t(item.title)}</p>
                <p className="text-[12.5px] text-ink-soft leading-snug line-clamp-2">{t(item.sub)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
