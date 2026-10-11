import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Nouvelle catégorie" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-5 anim-fade-up max-w-3xl">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-ink-soft hover:text-ink"
      >
        <Icon name="arrow-left" size={15} weight="bold" />
        Retour aux catégories
      </Link>
      <h1 className="text-[28px] font-bold">Nouvelle catégorie</h1>
      <CategoryForm />
    </div>
  );
}
