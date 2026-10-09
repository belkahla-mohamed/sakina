# PROGRESS

Steps: 0 → 10

| Step | Name | Status |
|------|------|--------|
| 0 | Project type | DONE — B) Multi-page website, reference talwine.com |
| 1 | Business discovery | DONE — Sakina Stores, Maroc, mothers & kids, WhatsApp orders, FR+AR, cart→WhatsApp, backend+admin, assets = logo only |
| 2 | References | DONE — talwine.com analyzed + design tokens extracted |
| 3 | Style direction | DONE — chose **B) Playful Candy** |
| 4 | Design tokens (4.1 colors, 4.2 type, 4.3 UI kit) | DONE — Bubblegum Pop + Baloo2/Nunito/Tajawal + Chunky Pop |
| 5 | Structure / sitemap + section layouts | DONE — 5.1 sitemap (B) · 5.2 section order · 5.3 navbar (A) · 5.4 icons (Phosphor) · 5.5 hero · 5.6 trust+promo · 5.7 categories · 5.8 grid · 5.9 testimonials (A) · 5.10 FAQ (A) · 5.11 CTA (C) · 5.12 footer (B) |
| 6 | Catalogue logic (if products) | DONE — A simple tables (categories+products, RLS read-only) · bis: WhatsApp msg AR then FR → DECISIONS #21 #22 |
| 7 | Content | DONE — copy FR+AR by assistant (A) + 24 placeholder products (i) → DECISIONS #23 |
| 8 | Tech stack | DONE (early) — Next.js (App Router) + Supabase (user choice, 2026-10-08) → DECISIONS #20 |
| 9 | Build (8 blocks) | **DONE** — all 8 blocks built, lint ✔, build ✔ (9 routes), E2E 29/29 ✔ |
| 10 | Review & delivery | **CURRENT** |

## Done
- [x] Step 0 chosen: B — multi-page, many pages, like talwine.com
- [x] /docs created with 7 memory files
- [x] /previews created
- [x] talwine.com fetched + structure analyzed → REFERENCES.md (REF-1)
- [x] Step 1 → PROJECT_BRIEF.md filled, DECISIONS.md #2
- [x] Step 2 → REFERENCES.md complete (tokens extracted from live CSS)
- [x] Step 3 → chose **B) Playful Candy** (3 mood-boards in /previews/step3/)
- [x] Step 4.1 → palette **A Bubblegum Pop**
- [x] Step 4.2 → fonts **B Baloo 2 / Nunito Sans / Tajawal**
- [x] Step 4.3 → UI kit **A Chunky Pop** · DESIGN_SYSTEM.md locked
- [x] Step 5 → sitemap + homepage §1-§12 layouts all chosen → DECISIONS.md #8-#19, previews /step5.3 … /step5.12
- [x] Step 6 → catalogue A simple + WhatsApp message AR→FR → DECISIONS #21 #22
- [x] Step 7 → copy FR+AR + 24 products in `data/catalog.json` → DECISIONS #23
- [x] Step 8 → Next.js 16 + Supabase → DECISIONS #20, TECH_STACK.md
- [x] Step 9 → build complete:
  - Block 1 setup (scaffold, Tailwind v4 tokens, fonts, supabase client, catalog + placeholders + seed)
  - Block 2 shell (announcement, navbar+search+drawer, footer B, lang/cart providers)
  - Block 3 home (hero, trust, promo, bento, grids, testimonials, FAQ, CTA)
  - Block 4 shop (search/filter/sort)
  - Block 5 product (+related)
  - Block 6 cart → checkout → WhatsApp (message AR then FR, validation)
  - Block 7 static (about, contact, faq, 404)
  - Block 8 polish: lint 0 errors, `next build` 9 routes OK (PPR on /shop + /product), E2E 29/29
  - Verified: FR/AR RTL toggle, mobile drawer (fixed backdrop-blur containing-block bug), search chips, bilingual WA message, screenshots
- [x] Contact data live: WhatsApp `212608308484` · email `sakinastores.online@gmail.com` · Casablanca (phone row on /contact, `dir="ltr"` fix so numbers never flip in AR)
- [x] Motion pass (show/hide + movement): drawer & search slide/fade (always-mounted + visibility toggle, RTL-aware), FAQ grid-rows height animation, staggered card entrances, scroll reveal on home sections (`animation-timeline: view()`), pop/bump feedback (badge, «Ajouté», qty, totals), btn/chip hover+press, `.field` smooth focus/error borders, `prefers-reduced-motion` respected — lint ✔ tsc ✔ E2E 29/29 ✔
- [x] Responsive/mobile-first pass (mobile focus + UX for every device):
  - Audit script over 8 viewports (320→1440) × 9 pages + drawer-open + search-open → **0 problems**: no horizontal overflow, no font <16px, no undersized tap targets (buttons/inputs ≥40px, links ≥24px per WCAG 2.5.8)
  - Inputs/selects at 16px (kills iOS focus-zoom), `.field` focus ring, `:focus-visible` outline everywhere (highlight color in footer), `touch-action: manipulation` + brand tap-highlight
  - Tap targets: header icon buttons / heart / drawer close / socials → 44px, `.chip` min-height 44, cart steppers 40px + «Retirer» min-h 40, footer & breadcrumb & «voir tout» link paddings, hero pills py-2
  - Layout: PDP buy row stacks on mobile (full-width stepper + CTA), cart line wraps (title row / stepper row on mobile, no more squeezed title), search overlay stacks at <sm, TrustStrip sublabels 2-line clamp, prices `white-space: nowrap` (+flex-wrap row on cards)
  - Card CTAs use short label «Ajouter/أضف» below `sm` (single-line pills), full label on ≥sm
  - a11y: skip link «Aller au contenu», `autoComplete` on checkout/contact/newsletter fields, real `aria-label`s for qty steppers + favorite (`aria-pressed`), newsletter `aria-label`
  - Verified: lint ✔ tsc ✔ audit 0 ✔ E2E 29/29 ✔ + fresh 320/390 screenshots (drawer, search, shop, product, cart, checkout)

- [x] **i18n zero-flash refresh**: `sakina_lang` cookie read in root layout → SSR sends `lang/dir/text` correct in first HTML byte (no FR→AR seconds flip); `instant = false` (docs-sanctioned for `cookies()` in layout), `Providers initialLang` server snapshot + cookie sync, `<main id="main">` skip target. Catalog getters get `use cache` (routes revalidate 15m).
- [x] **Mobile drawer + search polish**: panel slide 350ms `cubic-bezier(.32,.72,0,1)` (Tailwind v4 `translate` — fixed `transition-[...,transform,...]` miss that made search jump), backdrop blur, content stagger `.anim-rise` (header→links→categories→footer), search panel 280ms + form rise delay 90ms; `.card`/global `a,button` transitions extended with `translate/rotate/scale`.
- Verified: lint ✔ tsc ✔, **E2E 43/43 on dev (3001)** incl. new SSR-cookie/animation checks, **isolated `next build` ✔** (0-byte shells = fully dynamic) + **E2E 43/43 on prod `next start` (3002)**. Note: existing AR users get one last transitional refresh (cookie written on first visit), then always instant.

## Current step
Step 10 — Review & delivery: final visual pass, README/deploy prep, handover.

## Next
- Desktop/tablet visual spot-check of the responsive changes (1440 screenshots available in temp audit output)
- README + deployment setup (needs real Supabase URL/key)
- Step 10 sign-off

## Open questions
1. Product list + photos for the catalogue (placeholders in place — swap same JSON shape).
2. Logo file to be supplied.
3. ~~Real WhatsApp number~~ — resolved: `212608308484` (`.env.local`), email `sakinastores.online@gmail.com`, city Casablanca.
4. Supabase project URL + anon key (site runs on local fallback data meanwhile).
