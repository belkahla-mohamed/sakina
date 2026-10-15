import "server-only";
import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary upload, server-side only.
 *
 * The API secret never reaches the browser — the admin form posts the file to
 * /api/admin/upload, which calls this. The returned URL is a normal
 * `res.cloudinary.com` https URL, so it drops straight into the `image` column
 * and is served by next/image like any other remote image.
 */

/**
 * Cloudinary folder layout. Everything this app uploads lives under one root
 * folder (`sakina_stores`), subdivided by asset type, so the media library
 * stays navigable instead of becoming one flat pile.
 */
const FOLDERS = {
  product: "sakina_stores/products",
  category: "sakina_stores/categories",
  hero: "sakina_stores/hero",
  misc: "sakina_stores/misc",
} as const;

export type UploadKind = keyof typeof FOLDERS;

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.local."
    );
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);

/** Hard ceiling on the raw upload, so a stray 40MB file cannot blow the route. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export async function uploadImage(
  file: File,
  kind: UploadKind = "product"
): Promise<UploadedImage> {
  ensureConfigured();

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(
      `Format non supporté : ${file.type || "inconnu"}. JPEG, PNG, WebP, AVIF, GIF ou SVG uniquement.`
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum 8 Mo.`
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: FOLDERS[kind],
    resource_type: "image",
    // Cap the stored asset and let Cloudinary pick the best encoding. Anything
    // larger is re-scaled on the fly rather than stored at full size.
    transformation: [
      { width: 1600, height: 1600, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  ensureConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
