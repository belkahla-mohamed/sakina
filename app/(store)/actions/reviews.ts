"use server";

import { dbSubmitReview } from "@/lib/db/reviews";
import { revalidatePath } from "next/cache";

export interface SubmitReviewInput {
  name: string;
  city?: string;
  rating: number;
  text: string;
}

export interface SubmitReviewResult {
  ok: boolean;
  error?: string;
}

export async function submitReview(
  input: SubmitReviewInput
): Promise<SubmitReviewResult> {
  const name = typeof input?.name === "string" ? input.name.trim().slice(0, 100) : "";
  const city = typeof input?.city === "string" ? input.city.trim().slice(0, 100) : "";
  const text = typeof input?.text === "string" ? input.text.trim().slice(0, 1000) : "";
  const rating = Math.min(5, Math.max(1, Math.floor(Number(input?.rating) || 5)));

  if (!name || !text) {
    return {
      ok: false,
      error: "Veuillez renseigner votre nom et votre commentaire.",
    };
  }

  try {
    await dbSubmitReview({
      name,
      city: city || null,
      rating,
      text,
    });
    // Immediately revalidate the admin avis dashboard so the admin sees the pending review
    revalidatePath("/admin/avis");
    return { ok: true };
  } catch (err) {
    console.error("[submitReview] DB insert error:", err);
    return {
      ok: false,
      error: "Une erreur est survenue lors de l'enregistrement de votre avis. Veuillez réessayer.",
    };
  }
}
