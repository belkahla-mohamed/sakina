-- Multiple product images: the first entry is the cover (`image` stays the
-- canonical single cover for backwards compat), the rest are gallery shots.
alter table public.products add column if not exists images text[];
