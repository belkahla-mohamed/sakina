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
