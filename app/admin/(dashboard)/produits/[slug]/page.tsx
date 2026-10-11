import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Icon } from "@/components/Icon";
import { dbAdminProduct, dbAdminCategories } from "@/lib/db/store";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminSection } from "@/components/admin/AdminSection";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await dbAdminProduct(slug);
  if (!product) return { title: "Produit introuvable" };
  return { title: `Modifier · ${product.name_fr}` };
}

export default function EditProductPage({ params }: Params) {
  return (
    <AdminSection>
      <EditProductContent params={params} />
    </AdminSection>
  );
}

async function EditProductContent({ params }: Params) {
  await connection();
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    dbAdminProduct(slug),
    dbAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-5 anim-fade-up max-w-3xl">
      <Link
        href="/admin/produits"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-ink-soft hover:text-ink"
      >
        <Icon name="arrow-left" size={15} weight="bold" />
        Retour aux produits
      </Link>
      <h1 className="text-[28px] font-bold">Modifier · {product.name_fr}</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
