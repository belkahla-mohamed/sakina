import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { getProductRotation } from "@/lib/site";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export const metadata: Metadata = { title: "Mes favoris" };

export default async function FavoritesPage() {
  const [products, rotate] = await Promise.all([getProducts(), getProductRotation()]);
  return <FavoritesView products={products} autoRotate={rotate} />;
}
