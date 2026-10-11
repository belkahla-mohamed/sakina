import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { adminT } from "@/lib/admin-lang";
import { dbAdminCategories, dbAdminProducts } from "@/lib/db/store";
import { CategoryTable } from "@/components/admin/CategoryTable";
import { AdminSection } from "@/components/admin/AdminSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return { title: t("admin.nav.categories") };
}

export default function AdminCategoriesPage() {
  return (
    <AdminSection>
      <CategoriesContent />
    </AdminSection>
  );
}

async function CategoriesContent() {
  await connection();
  const t = await adminT();
  const [categories, products] = await Promise.all([
    dbAdminCategories(),
    dbAdminProducts(),
  ]);

  const counts: Record<string, number> = {};
  for (const c of categories) counts[c.slug] = 0;
  for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1;
  const countKey = categories.length > 1 ? "admin.category.countPl" : "admin.category.count";

  return (
    <div className="space-y-6 anim-fade-up">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-bold">{t("admin.nav.categories")}</h1>
          <p className="text-[14px] text-ink-soft">
            {t(countKey).replace("{n}", String(categories.length))}
          </p>
        </div>
        <Link href="/admin/categories/new" className="btn btn-primary">
          {t("admin.category.new")}
        </Link>
      </header>

      <CategoryTable categories={categories} counts={counts} products={products} />
    </div>
  );
}
