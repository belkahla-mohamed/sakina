-- Add an optional cover image to categories.
--
-- Why: the admin can now upload a category image (Cloudinary URL) instead of
-- only picking an icon. When set, the storefront shows the image and the icon
-- becomes the fallback.
--
-- Safe to re-run: `if not exists` makes it idempotent, and the nullable
-- column leaves every existing row untouched (NULL = keep showing the icon).

alter table public.categories add column if not exists image text;
