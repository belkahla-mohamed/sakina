"use client";

import Link from "next/link";
import { useLang } from "@/components/providers";
import { OfferBanner } from "@/components/OfferBanner";
import type { Offer } from "@/lib/types";

/**
 * Homepage offers section. The admin picks which offers appear here
 * (`show_on_home` in the offers editor); when none qualify, the whole
 * section disappears instead of rendering an empty block.
 */
export function OffersShowcase({ offers }: { offers: Offer[] }) {
  const { t } = useLang();

  // No featured offers → render nothing at all.
  if (offers.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 lg:px-6 py-10 md:py-14 anim-reveal">
      <div className="flex items-end justify-between mb-5">
        <h2 className="text-[28px] md:text-[32px] font-bold">
          {t("home.offersTitle")}
        </h2>
        <Link
          href="/offres"
          className="inline-block py-1.5 text-[13.5px] font-bold text-primary underline underline-offset-4"
        >
          {t("home.offersSeeAll")}
        </Link>
      </div>
      <div className="space-y-6">
        {offers.map((o, i) => (
          <OfferBanner key={o.id} offer={o} flip={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
