import type { Metadata } from "next";
import { connection } from "next/server";
import { dbAdminReviews } from "@/lib/db/reviews";
import { ReviewsTable } from "@/components/admin/ReviewsTable";
import { AdminSection } from "@/components/admin/AdminSection";

export const metadata: Metadata = { title: "Avis" };

export default function AdminReviewsPage() {
  return (
    <AdminSection>
      <ReviewsContent />
    </AdminSection>
  );
}

async function ReviewsContent() {
  await connection();
  const reviews = await dbAdminReviews();
  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6 anim-fade-up">
      <header>
        <h1 className="text-[28px] font-bold">Avis clients</h1>
        <p className="text-[14px] text-ink-soft">
          {reviews.length} avis · {pending} en attente de modération
        </p>
      </header>

      <ReviewsTable reviews={reviews} />
    </div>
  );
}
