import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/catalog";
import { ProductView } from "@/components/product/ProductView";
import { PageSkeleton } from "@/components/PageSkeleton";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name_fr,
    description: product.desc_fr,
  };
}

async function ProductContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProduct(slug), getProducts()]);

  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return <ProductView product={product} related={related} />;
}

export default function ProductPage({ params }: Params) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
