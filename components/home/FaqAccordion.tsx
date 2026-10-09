"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus } from "@phosphor-icons/react";
import { useLang } from "@/components/providers";

export interface FaqItem {
  id: string;
  q_fr: string;
  q_ar: string;
  a_fr: string;
  a_ar: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "delivery",
    q_fr: "Combien de temps prend la livraison ?",
    q_ar: "كم تستغرق مدة التوصيل؟",
    a_fr: "La livraison prend généralement entre 24h et 48h selon votre ville. Vous recevez un message WhatsApp dès que le colis part.",
    a_ar: "يستغرق التوصيل عادةً بين 24 و48 ساعة حسب مدينتك، وتصلك رسالة واتساب عند إرسال الطلب.",
  },
  {
    id: "free",
    q_fr: "La livraison est-elle gratuite ?",
    q_ar: "هل التوصيل مجاني؟",
    a_fr: "La livraison est offerte dès 300 DH d'achat. En dessous, elle est de 30 DH partout au Maroc.",
    a_ar: "التوصيل مجاني ابتداءً من 300 درهم. تحت ذلك، تكلفة التوصيل 30 درهمًا في جميع المدن المغربية.",
  },
  {
    id: "payment",
    q_fr: "Comment puis-je payer ?",
    q_ar: "كيف يمكنني الدفع؟",
    a_fr: "Vous payez à la livraison, en espèces, une fois le colis entre vos mains. Aucune carte bancaire n'est nécessaire.",
    a_ar: "تدفع عند الاستلام نقدًا بعد استلام الطرد. لا حاجة لأي بطاقة بنكية.",
  },
  {
    id: "returns",
    q_fr: "Puis-je retourner un article ?",
    q_ar: "هل يمكنني إرجاع منتج؟",
    a_fr: "Oui, sous 7 jours, si l'article est dans son emballage d'origine. Contactez-nous sur WhatsApp et on s'occupe du reste.",
    a_ar: "نعم، خلال 7 أيام إذا كان المنتج في تغليفه الأصلي. تواصل معنا عبر واتساب ونتكفّل بالباقي.",
  },
  {
    id: "whatsapp",
    q_fr: "Comment commander via WhatsApp ?",
    q_ar: "كيف أطلب عبر واتساب؟",
    a_fr: "Ajoutez vos articles au panier, remplissez votre nom, téléphone et adresse : un message tout prêt (arabe + français) s'ouvre dans WhatsApp, vous n'avez plus qu'à envoyer.",
    a_ar: "أضف منتجاتك إلى السلة، ثم أدخل اسمك وهاتفك وعنوانك: تُفتح رسالة جاهزة (بالعربية والفرنسية) في واتساب، وكل ما عليك هو الإرسال.",
  },
];

export function FaqAccordion({
  withHeader = true,
  heading = "h2",
}: {
  withHeader?: boolean;
  heading?: "h1" | "h2";
}) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState<string | null>(FAQ_ITEMS[0].id);
  const Heading = heading;

  return (
    <section className="mx-auto max-w-3xl px-4 lg:px-6 py-12 md:py-16 anim-reveal">
      {withHeader && (
        <div className="text-center mb-7">
          <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-primary">
            {t("home.faqSub")}
          </p>
          <Heading className="text-[28px] md:text-[34px] font-bold mt-2">{t("home.faqTitle")}</Heading>
        </div>
      )}

      <div className="card px-5 md:px-7">
        {FAQ_ITEMS.map((item) => {
          const isOpen = open === item.id;
          return (
            <div key={item.id} className="border-b-2 border-line last:border-b-0">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="group w-full flex justify-between items-center gap-4 py-4 text-start"
                aria-expanded={isOpen}
              >
                <span>
                  <span className="block font-display font-bold text-[16.5px] leading-tight">
                    {lang === "ar" ? item.q_ar : item.q_fr}
                  </span>
                </span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-transform duration-200 group-hover:scale-110 active:scale-90 ${
                    isOpen ? "bg-primary text-white border-ink" : "border-line text-ink"
                  }`}
                >
                  {isOpen ? <Minus size={15} weight="bold" /> : <Plus size={15} weight="bold" />}
                </span>
              </button>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className={`pb-4 -mt-1 text-[14.5px] text-ink-soft leading-relaxed transition-opacity duration-200 ${
                      isOpen ? "opacity-100" : "opacity-0"
                    } ${lang === "ar" ? "ar" : ""}`}
                  >
                    {lang === "ar" ? item.a_ar : item.a_fr}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-7">
        <p className="text-[14px] text-ink-soft">{t("home.faqNoAnswer")}</p>
        <Link href="/contact" className="inline-block font-display font-bold mt-1.5 text-primary underline underline-offset-4">
          {t("wa.cta")} <span className="arrow-end" aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
