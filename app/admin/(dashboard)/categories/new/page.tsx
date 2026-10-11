import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { adminT } from "@/lib/admin-lang";
import { CategoryForm } from "@/components/admin/CategoryForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return { title: t("admin.category.newTitle") };
}

export default async function NewCategoryPage() {
  const t = await adminT();
  return (
    <div className="space-y-5 anim-fade-up max-w-3xl">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-ink-soft hover:text-ink"
      >
        <Icon name="arrow-left" size={15} weight="bold" className="rtl:rotate-180" />
        {t("admin.category.back")}
      </Link>
      <h1 className="text-[28px] font-bold">{t("admin.category.newTitle")}</h1>
      <CategoryForm />
    </div>
  );
}
