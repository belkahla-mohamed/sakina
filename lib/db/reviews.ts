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

export const INITIAL_REVIEWS: ReviewRow[] = [
  {
    id: 1,
    name: "Salma",
    city: "Casablanca",
    rating: 5,
    text: "Livraison super rapide à Casablanca et le plaid est encore plus doux qu'en photo. J'en ai commandé un deuxième pour mon frère.",
    status: "approved",
    created_at: "2026-09-12T10:00:00.000Z",
  },
  {
    id: 2,
    name: "Nadia",
    city: "Rabat",
    rating: 5,
    text: "Je commande depuis 3 mois : toujours le même sérieux, et je paie à la livraison sans souci.",
    status: "approved",
    created_at: "2026-08-28T14:30:00.000Z",
  },
  {
    id: 3,
    name: "Imane",
    city: "Marrakech",
    rating: 5,
    text: "Le diffuseur d'arôme sent divin, et l'emballage est parfait pour offrir. Je recommande.",
    status: "approved",
    created_at: "2026-09-05T09:15:00.000Z",
  },
];

/** Public testimonials — approved only, cached. */
export async function dbApprovedReviews(): Promise<ReviewRow[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("reviews");
  try {
    return await q<ReviewRow>(
      `select * from public.reviews where status = 'approved'
       order by created_at desc limit 30`
    );
  } catch (e) {
    console.warn("[reviews] dbApprovedReviews failed:", e);
    return [];
  }
}

/** Safe store consumer for approved reviews — returns only reviews marked 'approved' in database. */
export async function getApprovedReviews(): Promise<ReviewRow[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("reviews");
  if (!process.env.DATABASE_URL) return [];
  try {
    return await dbApprovedReviews();
  } catch (e) {
    console.warn("[reviews] failed to fetch approved reviews:", e);
    return [];
  }
}


/** Public submit — lands as pending for moderation. */
export async function dbSubmitReview(input: {
  name: string;
  city?: string | null;
  rating: number;
  text: string;
}): Promise<void> {
  await q(
    `insert into public.reviews (name, city, rating, text, status) values ($1, $2, $3, $4, 'pending')`,
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

export async function dbUpdateReview(
  id: number,
  input: {
    name: string;
    city?: string | null;
    rating: number;
    text: string;
    status: ReviewStatus;
  }
): Promise<void> {
  await q(
    `update public.reviews
     set name = $1, city = $2, rating = $3, text = $4, status = $5
     where id = $6`,
    [input.name, input.city ?? null, input.rating, input.text, input.status, id]
  );
}

export async function dbDeleteReview(id: number): Promise<void> {
  await q("delete from public.reviews where id = $1", [id]);
}

export async function dbDeleteReviews(ids: number[]): Promise<number> {
  if (ids.length === 0) return 0;
  const rows = await q<{ one: number }>(
    "delete from public.reviews where id = any($1::bigint[]) returning 1",
    [ids]
  );
  return rows.length;
}
