-- ============================================================
-- Sakina — full schema in an ISOLATED `sakina` schema
-- ============================================================
-- Why a dedicated schema: this Supabase database already hosts another
-- application whose tables live in `public` (categories, admin_users, ...).
-- Everything Sakina owns lives under `sakina.*` so the two apps can never
-- collide or read each other's rows.
--
-- Security model (least exposure):
--   * Every table has ROW LEVEL SECURITY enabled.
--   * NO grant is given to anon / authenticated → the public Supabase anon
--     key can not read or write a single Sakina row.
--   * The app connects server-side only with DATABASE_URL (owner role), which
--     bypasses RLS. That URL is never exposed to the browser (`server-only`).
--   * Admin passwords are scrypt-hashed here; sessions are random tokens.
--
-- Safe to re-run (idempotent). Run in the Supabase SQL editor or via psql.
-- ============================================================

create schema if not exists sakina;

-- Defense in depth: revoke any default PUBLIC access on the whole schema.
revoke all on schema sakina from public;
revoke all on schema sakina from anon;
revoke all on schema sakina from authenticated;

-- ============================================================
-- STORE
-- ============================================================

create table if not exists public.categories (
  slug text primary key,
  name_fr text not null,
  name_ar text not null,
  tagline_fr text,
  tagline_ar text,
  color text not null default '#FF6B9D',
  text text not null default 'light',
  icon text not null default 'gift',
  image text,
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

-- ============================================================
-- ORDERS (WhatsApp checkout is recorded here)
-- ============================================================

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  reference text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_city text not null,
  customer_address text not null,
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null,
  status text not null default 'nouvelle'
    check (status in ('nouvelle','en_cours','livree','annulee')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders (status, created_at desc);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  slug text not null,
  name_fr text not null,
  name_ar text not null,
  price numeric(10,2) not null,
  qty int not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- ============================================================
-- REVIEWS (public submits → pending; admin approves → public)
-- ============================================================

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  name text not null,
  city text,
  rating int not null check (rating between 1 and 5),
  text text not null,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_status_idx on public.reviews (status, created_at desc);

-- ============================================================
-- SETTINGS (key/value — overrides hardcoded SITE values)
-- ============================================================

create table if not exists public.settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into public.settings (key, value) values
  ('whatsapp', '212608308484'),
  ('free_shipping_from', '300'),
  ('announce_fr', 'Livraison gratuite dès 300 DH · Paiement à la livraison · Retour sous 7 jours'),
  ('announce_ar', 'التوصيل مجاني ابتداءً من 300 درهم · الدفع عند الاستلام · إرجاع خلال 7 أيام'),
  ('site_name', 'Sakina'),
  ('site_name_ar', 'ساكينا'),
  ('social_instagram', ''),
  ('social_tiktok', ''),
  ('social_facebook', ''),
  ('delivery_casablanca', '20'),
  ('delivery_outside', '35')
on conflict (key) do nothing;

-- ============================================================
-- ADMIN USERS + SESSIONS (custom auth)
-- ============================================================

create table if not exists public.admin_users (
  id bigint generated always as identity primary key,
  email text not null unique,
  password_hash text not null,
  name text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.admin_sessions (
  id text primary key,
  admin_id bigint not null references public.admin_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists admin_sessions_admin_idx on public.admin_sessions (admin_id);
create index if not exists admin_sessions_expires_idx on public.admin_sessions (expires_at);

create or replace function sakina.prune_admin_sessions() returns void
language sql as $$ delete from public.admin_sessions where expires_at < now(); $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- RLS on + no policies for anon/authenticated → those roles get nothing.
-- The owner (the app's server-side DATABASE_URL) bypasses RLS.
-- ============================================================

alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.order_items   enable row level security;
alter table public.reviews       enable row level security;
alter table public.settings      enable row level security;
alter table public.admin_users   enable row level security;
alter table public.admin_sessions enable row level security;

-- Belt & braces: explicitly deny everything to the public API roles.
revoke all on all tables in schema sakina from anon, authenticated, public;
