import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { dbAdminProducts, dbAdminCategories } from "@/lib/db/store";
import { ProductTable } from "@/components/admin/ProductTable";
import { AdminSection } from "@/components/admin/AdminSection";

export const metadata: Metadata = { title: "Produits" };

export default function AdminProductsPage() {
  return (
    <AdminSection>
      <ProductsContent />
    </AdminSection>
  );
}

async function ProductsContent() {
  await connection();
  const [products, categories] = await Promise.all([
    dbAdminProducts(),
    dbAdminCategories(),
  ]);

  return (
    <div className="space-y-6 anim-fade-up">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold">Produits</h1>
          <p className="text-[14px] text-ink-soft">
            {products.length} produit{products.length > 1 ? "s" : ""} dans le
            catalogue.
          </p>
        </div>
        <Link href="/admin/produits/new" className="btn btn-primary">
          + Nouveau produit
        </Link>
      </header>

      <ProductTable products={products} categories={categories} />
    </div>
  );
}
