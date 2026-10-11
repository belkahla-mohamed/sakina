import type { Metadata } from "next";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { FAQ_ITEMS } from "@/lib/faq";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Livraison, paiement à la livraison, retours et commande par WhatsApp.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({
      "@type": "Question",
      name: f.q_fr,
      acceptedAnswer: { "@type": "Answer", text: f.a_fr },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <FaqAccordion heading="h1" />
    </>
  );
}
