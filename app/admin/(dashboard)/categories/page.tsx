import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { dbAdminCategories, dbAdminProducts } from "@/lib/db/store";
import { CategoryTable } from "@/components/admin/CategoryTable";
import { AdminSection } from "@/components/admin/AdminSection";

export const metadata: Metadata = { title: "Catégories" };

export default function AdminCategoriesPage() {
  return (
    <AdminSection>
      <CategoriesContent />
    </AdminSection>
  );
}

async function CategoriesContent() {
  await connection();
  const [categories, products] = await Promise.all([
    dbAdminCategories(),
    dbAdminProducts(),
  ]);

  const counts: Record<string, number> = {};
  for (const c of categories) counts[c.slug] = 0;
  for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;

  return (
    <div className="space-y-6 anim-fade-up">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold">Catégories</h1>
          <p className="text-[14px] text-ink-soft">
            {categories.length} catégorie{categories.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Link href="/admin/categories/new" className="btn btn-primary">
          + Nouvelle catégorie
        </Link>
      </header>

      <CategoryTable categories={categories} counts={counts} products={products} />
    </div>
  );
}
