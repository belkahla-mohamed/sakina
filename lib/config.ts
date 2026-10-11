export const SITE = {
  name: "Sakina",
  name_ar: "ساكينا",
  url: "https://www.sakinastores.com",
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

/**
 * Store settings that can be overridden from the admin panel.
 * Lives here (not in the server-only lib/site.ts) so client components can
 * import the type safely.
 */
export interface PublicSettings {
  whatsapp: string;
  freeShippingFrom: number;
  announce_fr: string;
  announce_ar: string;
  site_name: string;
  site_name_ar: string;
  social_instagram: string;
  social_tiktok: string;
  social_facebook: string;
}
