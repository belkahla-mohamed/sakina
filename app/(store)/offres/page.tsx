import type { Metadata } from "next";
import { getOffers } from "@/lib/site";
import { OffersPageView } from "@/components/shop/OffersPageView";

export const metadata: Metadata = {
  title: "Nos offres",
  description:
    "Promotions en cours chez Sakina : réductions limitées sur nos best-sellers. Paiement à la livraison partout au Maroc.",
};

/** Public listing of every active offer (French naming, like /admin/offres). */
export default async function OffersPage() {
  const offers = await getOffers();
  return <OffersPageView offers={offers} />;
}
