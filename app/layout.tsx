import type { Metadata } from "next";
import { Prata, Karla, Tajawal } from "next/font/google";
import { cookies } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE } from "@/lib/config";
import { getPublicSettings } from "@/lib/site";
import { LANG_COOKIE } from "@/lib/i18n";
import { Providers } from "@/components/providers";

const prata = Prata({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-prata",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-karla",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Planners, Carnets de recettes, Livres de coloriage, mugs et gourdes`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Planners inspirants • Carnets de recettes gourmands • Livres de coloriage relaxants • mugs et gourdes Isotherme",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fr_MA",
    alternateLocale: ["ar_MA"],
    siteName: SITE.name,
    title: `${SITE.name} — Planners, Carnets de recettes, Livres de coloriage, mugs et gourdes`,
    description:
      "Planners inspirants • Carnets de recettes gourmands • Livres de coloriage relaxants • mugs et gourdes Isotherme",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Planners, Carnets de recettes, Livres de coloriage, mugs et gourdes`,
    description:
      "Planners inspirants • Carnets de recettes gourmands • Livres de coloriage relaxants • mugs et gourdes Isotherme",
  },
  robots: { index: true, follow: true },
};

export const instant = false;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const initialLang = cookieStore.get(LANG_COOKIE)?.value === "ar" ? "ar" : "fr";
  const settings = await getPublicSettings();

  return (
    <html
      lang={initialLang}
      dir={initialLang === "ar" ? "rtl" : "ltr"}
      className={`${prata.variable} ${karla.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Providers initialLang={initialLang} settings={settings}>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
