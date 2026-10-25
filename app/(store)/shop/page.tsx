import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories, getProducts } from "@/lib/catalog";
import { getProductRotation } from "@/lib/site";
import { ShopView } from "@/components/shop/ShopView";
import { PageSkeleton } from "@/components/PageSkeleton";

export const metadata: Metadata = {
  title: "Tous les produits",
  description:
    "Planners inspirants • Carnets de recettes gourmands • Livres de coloriage relaxants • mugs et gourdes Isotherme — livraison partout au Maroc.",
};

interface Search {
  q?: string;
  cat?: string;
  sort?: string;
}

async function ShopContent({ searchParams }: { searchParams: Promise<Search> }) {
  const [products, categories, params, rotate] = await Promise.all([
    getProducts(),
    getCategories(),
    searchParams,
    getProductRotation(),
  ]);

  return (
    <ShopView
      products={products}
      categories={categories}
      autoRotate={rotate}
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
