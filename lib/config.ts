export const SITE = {
  name: "Sakina",
  name_ar: "ساكينا",
  tagline: "Le quotidien des mamans et des enfants, livré en 24-48h.",
  tagline_ar: "يوميات الأمهات والأطفال، تصلك خلال 24-48 ساعة.",
  city: "Casablanca, Maroc",
  city_ar: "الدار البيضاء، المغرب",
  hours: "Lun–Sam · 9h–19h",
  hours_ar: "الاثنين–السبت · 9ص–7م",
  email: "sakinastores.online@gmail.com",
  // Real number (international format, no +)
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212608308484",
  freeShippingFrom: 300,
} as const;
