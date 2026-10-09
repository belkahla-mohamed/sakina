import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export const metadata: Metadata = { title: "Mes favoris" };

export default async function FavoritesPage() {
  const products = await getProducts();
  return <FavoritesView products={products} />;
}
