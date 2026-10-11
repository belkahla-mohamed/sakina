import { NextRequest, NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth";
import { uploadImage, MAX_UPLOAD_BYTES, type UploadKind } from "@/lib/cloudinary";

const KINDS: UploadKind[] = ["product", "category", "misc"];

/**
 * POST /api/admin/upload
 *
 * multipart/form-data with a single `file` field (plus optional `kind`).
 * Returns `{ url, publicId, width, height, bytes, format }`.
 *
 * The Cloudinary secret stays on the server; the browser only ever sees the
 * resulting https URL, which is what gets written to the `image` column.
 */
export async function POST(req: NextRequest) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide (multipart/form-data attendu)." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Fichier vide." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: `Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum 8 Mo.`,
      },
      { status: 413 }
    );
  }

  const kindRaw = form.get("kind");
  const kind =
    typeof kindRaw === "string" && KINDS.includes(kindRaw as UploadKind)
      ? (kindRaw as UploadKind)
      : "product";

  try {
    const uploaded = await uploadImage(file, kind);
    return NextResponse.json(uploaded, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Échec de l'envoi vers Cloudinary.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
