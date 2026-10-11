import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { adminT } from "@/lib/admin-lang";
import { dbAdminProducts, dbAdminCategories } from "@/lib/db/store";
import { ProductTable } from "@/components/admin/ProductTable";
import { AdminSection } from "@/components/admin/AdminSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return { title: t("admin.nav.products") };
}

export default function AdminProductsPage() {
  return (
    <AdminSection>
      <ProductsContent />
    </AdminSection>
  );
}

async function ProductsContent() {
  await connection();
  const t = await adminT();
  const [products, categories] = await Promise.all([
    dbAdminProducts(),
    dbAdminCategories(),
  ]);
  const countKey = products.length > 1 ? "admin.product.countPl" : "admin.product.count";

  return (
    <div className="space-y-6 anim-fade-up">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold">{t("admin.nav.products")}</h1>
          <p className="text-[14px] text-ink-soft">
            {t(countKey).replace("{n}", String(products.length))}
          </p>
        </div>
        <Link href="/admin/produits/new" className="btn btn-primary">
          {t("admin.dash.newProduct")}
        </Link>
      </header>

      <ProductTable products={products} categories={categories} />
    </div>
  );
}
