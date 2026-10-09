import type { Metadata } from "next";
import { Baloo_2, Nunito_Sans, Tajawal } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { SITE } from "@/lib/config";
import { LANG_COOKIE } from "@/lib/i18n";
import { getCategories, getProducts } from "@/lib/catalog";
import { Providers } from "@/components/providers";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — Jouets, éveil & école | Livraison 24-48h au Maroc`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Jouets d'éveil, livres, fournitures scolaires et vêtements bébé. Paiement à la livraison, retours sous 7 jours, livraison 24-48h partout au Maroc.",
};

export const instant = false;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const initialLang = cookieStore.get(LANG_COOKIE)?.value === "ar" ? "ar" : "fr";
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <html
      lang={initialLang}
      dir={initialLang === "ar" ? "rtl" : "ltr"}
      className={`${baloo.variable} ${nunito.variable} ${tajawal.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <Providers initialLang={initialLang}>
          <AnnouncementBar />
          <Navbar categories={categories} products={products} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
