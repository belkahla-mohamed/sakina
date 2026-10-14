-- Sakina — schema for Supabase (PostgreSQL)
-- Generated from the live database.
-- Run this in the Supabase SQL Editor. Tables live in the default `public`
-- schema, so they show up in the Supabase Table Editor without switching
-- schemas.
--
-- Idempotent: safe to re-run.

create schema if not exists public;

create table if not exists public.admin_sessions (
  id text not null,
  admin_id bigint not null,
  created_at timestamptz default now() not null,
  expires_at timestamptz not null,
  primary key (id),
  foreign key (admin_id) references public.admin_users (id)
);

create table if not exists public.admin_users (
  id bigint generated always as identity not null,
  email text not null,
  password_hash text not null,
  name text,
  created_at timestamptz default now() not null,
  last_login_at timestamptz,
  primary key (id),
  unique (email)
);

create table if not exists public.categories (
  slug text not null,
  name_fr text not null,
  name_ar text not null,
  tagline_fr text,
  tagline_ar text,
  color text default '#FF6B9D'::text not null,
  text text default 'light'::text not null,
  icon text default 'gift'::text not null,
  image text,
  featured boolean default false not null,
  primary key (slug)
);

create table if not exists public.order_items (
  id bigint generated always as identity not null,
  order_id bigint not null,
  slug text not null,
  name_fr text not null,
  name_ar text not null,
  price numeric(10,2) not null,
  qty integer not null,
  primary key (id),
  foreign key (order_id) references public.orders (id)
);

create table if not exists public.orders (
  id bigint generated always as identity not null,
  reference text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_city text not null,
  customer_address text not null,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null,
  status text default 'nouvelle'::text not null,
  note text,
  created_at timestamptz default now() not null,
  primary key (id),
  unique (reference)
);

create table if not exists public.products (
  slug text not null,
  name_fr text not null,
  name_ar text not null,
  category text not null,
  price numeric(10,2) not null,
  old_price numeric(10,2),
  badge text,
  rating numeric(2,1) default 5.0 not null,
  reviews integer default 0 not null,
  stock integer default 0 not null,
  is_new boolean default false not null,
  is_bestseller boolean default false not null,
  desc_fr text,
  desc_ar text,
  image text,
  created_at timestamptz default now() not null,
  primary key (slug),
  foreign key (category) references public.categories (slug)
);

create table if not exists public.reviews (
  id bigint generated always as identity not null,
  name text not null,
  city text,
  rating integer not null,
  text text not null,
  status text default 'pending'::text not null,
  created_at timestamptz default now() not null,
  primary key (id)
);

create table if not exists public.settings (
  key text not null,
  value text not null,
  updated_at timestamptz default now() not null,
  primary key (key)
);

create table if not exists public.backups (
  id bigint generated always as identity not null,
  kind text default 'manual'::text not null,
  note text,
  products_count integer default 0 not null,
  categories_count integer default 0 not null,
  orders_count integer default 0 not null,
  reviews_count integer default 0 not null,
  settings_count integer default 0 not null,
  size_bytes integer default 0 not null,
  data jsonb not null,
  created_at timestamptz default now() not null,
  primary key (id),
  check (kind in ('manual', 'auto', 'prerestore'))
);

CREATE INDEX IF NOT EXISTS admin_sessions_admin_idx ON public.admin_sessions USING btree (admin_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON public.admin_sessions USING btree (expires_at);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items USING btree (order_id);
CREATE INDEX IF NOT EXISTS orders_created_idx ON public.orders USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders USING btree (status, created_at DESC);
CREATE INDEX IF NOT EXISTS products_bestseller_idx ON public.products USING btree (is_bestseller DESC);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products USING btree (category);
CREATE INDEX IF NOT EXISTS reviews_status_idx ON public.reviews USING btree (status, created_at DESC);
CREATE INDEX IF NOT EXISTS backups_created_idx ON public.backups USING btree (created_at DESC);
-- ── Row Level Security ──────────────────────────────────────────────────────
-- RLS is ON with no policies, so anon/authenticated keys return zero rows.
-- The app is unaffected: it connects as the postgres owner via DATABASE_URL,
-- and the table owner bypasses RLS (unless FORCE is set, which it is not).
-- ALTER ... ENABLE is a no-op when RLS is already on, so this is re-runnable.
alter table public.admin_sessions enable row level security;
alter table public.admin_users enable row level security;
alter table public.backups enable row level security;
alter table public.categories enable row level security;
alter table public.order_items enable row level security;
alter table public.orders enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.settings enable row level security;

