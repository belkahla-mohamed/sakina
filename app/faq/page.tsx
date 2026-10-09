import type { Metadata } from "next";
import { FaqAccordion } from "@/components/home/FaqAccordion";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Livraison, paiement à la livraison, retours et commande par WhatsApp.",
};

export default function FaqPage() {
  return <FaqAccordion heading="h1" />;
}
