import { getCategories, getProducts } from "@/lib/catalog";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default async function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <>
      <AnnouncementBar />
      <Navbar categories={categories} products={products} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
