"use client";

import { useLang } from "@/components/providers";
import { OfferBanner } from "@/components/OfferBanner";
import type { Offer } from "@/lib/types";

/** Public /offres page body: lists every active offer (no admin filter). */
export function OffersPageView({ offers }: { offers: Offer[] }) {
  const { t } = useLang();

  return (
    <section className="mx-auto max-w-6xl px-4 lg:px-6 py-10 md:py-14">
      <h1 className="text-[30px] md:text-[36px] font-bold">
        {t("home.offersTitle")}
      </h1>
      {offers.length === 0 ? (
        <div className="card p-10 text-center mt-6">
          <p className="text-[15px] text-ink-soft">{t("offers.empty")}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {offers.map((o, i) => (
            <OfferBanner key={o.id} offer={o} flip={i % 2 === 1} />
          ))}
        </div>
      )}
    </section>
  );
}
