import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Icon } from "@/components/Icon";
import { dbAdminCategories } from "@/lib/db/store";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminSection } from "@/components/admin/AdminSection";

export const metadata: Metadata = { title: "Nouveau produit" };

export default function NewProductPage() {
  return (
    <AdminSection>
      <NewProductContent />
    </AdminSection>
  );
}

async function NewProductContent() {
  await connection();
  const categories = await dbAdminCategories();

  return (
    <div className="space-y-5 anim-fade-up max-w-3xl">
      <Link
        href="/admin/produits"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-ink-soft hover:text-ink"
      >
        <Icon name="arrow-left" size={15} weight="bold" />
        Retour aux produits
      </Link>
      <h1 className="text-[28px] font-bold">Nouveau produit</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
