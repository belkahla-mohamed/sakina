import { writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { categories, products } = JSON.parse(readFileSync(join(root, "data/catalog.json"), "utf8"));

const q = (s) => (s === null || s === undefined ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const n = (v) => (v === null || v === undefined ? "NULL" : String(v));

const catRows = categories
  .map(
    (c) =>
      `  (${q(c.slug)}, ${q(c.name_fr)}, ${q(c.name_ar)}, ${q(c.tagline_fr)}, ${q(c.tagline_ar)}, ${q(c.color)}, ${q(c.text)}, ${q(c.icon)}, ${c.featured ? "true" : "false"})`
  )
  .join(",\n");

const prodRows = products
  .map(
    (p) =>
      `  (${q(p.slug)}, ${q(p.name_fr)}, ${q(p.name_ar)}, ${q(p.category)}, ${n(p.price)}, ${n(p.old_price)}, ${q(p.badge)}, ${n(p.rating)}, ${n(p.reviews)}, ${n(p.stock)}, ${p.is_new}, ${p.is_bestseller}, ${q(p.desc_fr)}, ${q(p.desc_ar)}, ${q(p.image ?? `/img/products/${p.slug}.svg`)})`
  )
  .join(",\n");

const sql = `-- Sakina — schema + seed (generated from data/catalog.json)
-- Run in the Supabase SQL editor. Safe to re-run (upserts).

create table if not exists public.categories (
  slug text primary key,
  name_fr text not null,
  name_ar text not null,
  tagline_fr text,
  tagline_ar text,
  color text not null default '#FF6B9D',
  text text not null default 'light',
  icon text not null default 'gift',
  featured boolean not null default false
);

create table if not exists public.products (
  slug text primary key,
  name_fr text not null,
  name_ar text not null,
  category text not null references public.categories(slug) on delete cascade,
  price numeric(10,2) not null,
  old_price numeric(10,2),
  badge text check (badge in ('nouveau','promo','epuise')),
  rating numeric(2,1) not null default 5.0,
  reviews int not null default 0,
  stock int not null default 0,
  is_new boolean not null default false,
  is_bestseller boolean not null default false,
  desc_fr text,
  desc_ar text,
  image text,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_bestseller_idx on public.products (is_bestseller desc);

alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "anon read categories" on public.categories;
create policy "anon read categories" on public.categories for select to anon using (true);

drop policy if exists "anon read products" on public.products;
create policy "anon read products" on public.products for select to anon using (true);

insert into public.categories (slug, name_fr, name_ar, tagline_fr, tagline_ar, color, text, icon, featured) values
${catRows}
on conflict (slug) do update set
  name_fr = excluded.name_fr, name_ar = excluded.name_ar,
  tagline_fr = excluded.tagline_fr, tagline_ar = excluded.tagline_ar,
  color = excluded.color, text = excluded.text, icon = excluded.icon,
  featured = excluded.featured;

insert into public.products
  (slug, name_fr, name_ar, category, price, old_price, badge, rating, reviews, stock, is_new, is_bestseller, desc_fr, desc_ar, image)
values
${prodRows}
on conflict (slug) do update set
  name_fr = excluded.name_fr, name_ar = excluded.name_ar,
  category = excluded.category, price = excluded.price,
  old_price = excluded.old_price, badge = excluded.badge,
  rating = excluded.rating, reviews = excluded.reviews,
  stock = excluded.stock, is_new = excluded.is_new,
  is_bestseller = excluded.is_bestseller,
  desc_fr = excluded.desc_fr, desc_ar = excluded.desc_ar,
  image = excluded.image;
`;

writeFileSync(join(root, "data/seed.sql"), sql, "utf8");
console.log(`Wrote data/seed.sql (${categories.length} categories, ${products.length} products)`);
