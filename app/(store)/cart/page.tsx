import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Mon panier" };

export default async function CartPage() {
  const products = await getProducts();
  return <CartView products={products} />;
}
