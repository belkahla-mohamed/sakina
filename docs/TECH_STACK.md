# TECH STACK

Status: **DECIDED — Step 8 (2026-10-08, user choice: Next.js + Supabase)**

## Framework
- **Next.js (App Router)** — React, TypeScript, Tailwind CSS
- Server Components for catalogue pages (SEO), Client Components for cart/search

## Backend
- **Supabase**
  - Postgres database (products, categories, later orders)
  - Storage for product images
  - RLS: anon role = read-only on catalogue tables
  - Auth (Supabase Studio) reserved for a future admin area — not required for v1
- Orders are **not** stored as e-commerce orders in v1: checkout sends the cart to **WhatsApp** (see SITEMAP §5). Optionally an `orders` log table later.

## Libraries
- `@supabase/supabase-js` (or `@supabase/ssr` for server-side cookies)
- Tailwind CSS (already used in previews)
- Phosphor icons (locked Step 5.4)
- Cart: local state (Context + localStorage) — no backend cart in v1
- Language: FR default + AR toggle (client-side dictionary), RTL support via Tailwind `dir` attribute

## Folder structure
```
/
├── docs/            # memory files (this)
├── previews/        # step-by-step HTML option previews (Tailwind CDN)
├── app/             # Next.js App Router routes
│   ├── page.tsx     # home
│   ├── shop/
│   ├── product/[slug]/
│   ├── cart/
│   ├── checkout/
│   ├── about/ contact/ faq/
│   └── not-found/
├── components/      # UI blocks (Navbar, Hero, ProductCard, ...)
├── lib/             # supabase client, helpers
├── data/            # seed SQL, i18n dictionaries
└── public/          # images, logo
```

## Naming conventions
- Files: `kebab-case` folders, `PascalCase` component files, `*.page.tsx` not used — one page per route folder
- Routes: lowercase, no trailing slash
- CSS: Tailwind utility classes + design tokens from DESIGN_SYSTEM.md as CSS variables in `globals.css`

## Deployment
- TBD (likely Vercel + Supabase hosted) — confirm at delivery

## Notes
- Previews stay build-free (Tailwind CDN) until Step 9 (build).
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (never commit keys).
