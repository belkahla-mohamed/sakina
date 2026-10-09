import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories, getProducts } from "@/lib/catalog";
import { ShopView } from "@/components/shop/ShopView";
import { PageSkeleton } from "@/components/PageSkeleton";

export const metadata: Metadata = {
  title: "Tous les produits",
  description:
    "Jouets d'éveil, livres, fournitures scolaires, coffrets et vêtements bébé — livraison 24-48h partout au Maroc.",
};

interface Search {
  q?: string;
  cat?: string;
  sort?: string;
}

async function ShopContent({ searchParams }: { searchParams: Promise<Search> }) {
  const [products, categories, params] = await Promise.all([
    getProducts(),
    getCategories(),
    searchParams,
  ]);

  return (
    <ShopView
      products={products}
      categories={categories}
      initial={{
        q: params.q ?? "",
        cat: params.cat ?? "",
        sort: params.sort ?? "",
      }}
    />
  );
}

export default function ShopPage({ searchParams }: { searchParams: Promise<Search> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ShopContent searchParams={searchParams} />
    </Suspense>
  );
}
