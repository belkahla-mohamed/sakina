import type { Metadata } from "next";
import { connection } from "next/server";
import { adminT } from "@/lib/admin-lang";
import { dbAdminReviews } from "@/lib/db/reviews";
import { ReviewsTable } from "@/components/admin/ReviewsTable";
import { AdminSection } from "@/components/admin/AdminSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await adminT();
  return { title: t("admin.nav.reviews") };
}

export default function AdminReviewsPage() {
  return (
    <AdminSection>
      <ReviewsContent />
    </AdminSection>
  );
}

async function ReviewsContent() {
  await connection();
  const t = await adminT();
  const reviews = await dbAdminReviews();
  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6 anim-fade-up">
      <header>
        <h1 className="text-[28px] font-bold">{t("admin.review.title")}</h1>
        <p className="text-[14px] text-ink-soft">
          {t("admin.review.summary").replace("{n}", String(reviews.length)).replace("{m}", String(pending))}
        </p>
      </header>

      <ReviewsTable reviews={reviews} />
    </div>
  );
}
