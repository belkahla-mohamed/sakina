import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { CheckoutView } from "@/components/cart/CheckoutView";

export const metadata: Metadata = { title: "Commander sur WhatsApp" };

export default async function CheckoutPage() {
  const products = await getProducts();
  return <CheckoutView products={products} />;
}
