import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Icon } from "@/components/Icon";
import { dbAdminCategory } from "@/lib/db/store";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { AdminSection } from "@/components/admin/AdminSection";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = await dbAdminCategory(slug);
  if (!category) return { title: "Catégorie introuvable" };
  return { title: `Modifier · ${category.name_fr}` };
}

export default function EditCategoryPage({ params }: Params) {
  return (
    <AdminSection>
      <EditCategoryContent params={params} />
    </AdminSection>
  );
}

async function EditCategoryContent({ params }: Params) {
  await connection();
  const { slug } = await params;
  const category = await dbAdminCategory(slug);

  if (!category) notFound();

  return (
    <div className="space-y-5 anim-fade-up max-w-3xl">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-ink-soft hover:text-ink"
      >
        <Icon name="arrow-left" size={15} weight="bold" />
        Retour aux catégories
      </Link>
      <h1 className="text-[28px] font-bold">Modifier · {category.name_fr}</h1>
      <CategoryForm category={category} />
    </div>
  );
}
