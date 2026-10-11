import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { q } from "./pool";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ReviewRow {
  id: number;
  name: string;
  city: string | null;
  rating: number;
  text: string;
  status: ReviewStatus;
  created_at: string;
}

/** Public testimonials — approved only, cached. */
export async function dbApprovedReviews(): Promise<ReviewRow[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("reviews");
  return q<ReviewRow>(
    `select * from public.reviews where status = 'approved'
     order by created_at desc limit 30`
  );
}

/** Public submit — lands as pending for moderation. */
export async function dbSubmitReview(input: {
  name: string;
  city?: string;
  rating: number;
  text: string;
}): Promise<void> {
  await q(
    `insert into public.reviews (name, city, rating, text) values ($1,$2,$3,$4)`,
    [input.name, input.city ?? null, input.rating, input.text]
  );
}

/* ---------------- Admin ---------------- */

export async function dbAdminReviews(status?: ReviewStatus): Promise<ReviewRow[]> {
  if (status) {
    return q<ReviewRow>(
      "select * from public.reviews where status = $1 order by created_at desc",
      [status]
    );
  }
  return q<ReviewRow>(
    `select * from public.reviews order by
       case status when 'pending' then 0 when 'approved' then 1 else 2 end,
       created_at desc`
  );
}

export async function dbSetReviewStatus(
  id: number,
  status: ReviewStatus
): Promise<void> {
  await q("update public.reviews set status = $1 where id = $2", [status, id]);
}

export async function dbDeleteReview(id: number): Promise<void> {
  await q("delete from public.reviews where id = $1", [id]);
}
