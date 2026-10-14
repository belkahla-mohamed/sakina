import { NextRequest, NextResponse } from "next/server";
import { getSessionAdmin } from "@/lib/auth";
import { uploadImage, MAX_UPLOAD_BYTES, type UploadKind } from "@/lib/cloudinary";
import { adminT } from "@/lib/admin-lang";
import { explainError } from "@/lib/admin-errors";

const KINDS: UploadKind[] = ["product", "category", "misc"];

/**
 * POST /api/admin/upload
 *
 * multipart/form-data with a single `file` field (plus optional `kind`).
 * Returns `{ url, publicId, width, height, bytes, format }`.
 *
 * Every failure returns `{ error, solution }` in the admin's language so
 * ImageField can show the problem AND the next step — never a bare code.
 */
export async function POST(req: NextRequest) {
  const admin = await getSessionAdmin();
  const t = await adminT();
  if (!admin) {
    return NextResponse.json(
      {
        error: t("admin.msg.unauthorized"),
        solution: t("admin.msg.unauthorizedSol"),
      },
      { status: 401 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      {
        error: t("admin.msg.uploadRejected"),
        solution: t("admin.msg.uploadRejectedSol"),
      },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        error: t("admin.msg.uploadRejected"),
        solution: t("admin.msg.uploadRejectedSol"),
      },
      { status: 400 }
    );
  }
  if (file.size === 0) {
    return NextResponse.json(
      {
        error: t("admin.msg.uploadRejected"),
        solution: t("admin.msg.uploadRejectedSol"),
      },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: t("admin.form.tooHeavy").replace(
          "{n}",
          (file.size / 1024 / 1024).toFixed(1)
        ),
        solution: t("admin.msg.uploadRejectedSol"),
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
    // Cloudinary / network failures → mapped problem + solution (FR/AR).
    const { title, solution } = explainError(e, t.lang);
    return NextResponse.json({ error: title, solution }, { status: 502 });
  }
}
