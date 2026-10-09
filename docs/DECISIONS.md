# DECISIONS LOG

Format: numbered entries — date | step | options shown | choice | reason

---

## 1. 2026-10-08 | Step 0 — Project type
- **Options:** A) Landing page · B) Multi-page website · C) Catalogue · D) Combination
- **Choice:** **B** — multi-page, "maxi" many pages, like https://talwine.com/
- **Reason:** user wants a large multi-page site modelled on talwine.com.

## 2. 2026-10-08 | Step 1 — Business discovery
- **Name:** Sakina Stores
- **Activity:** children's products (same vibe as talwine)
- **Market:** Morocco
- **Audience options:** A) women & girls · B) mothers & children · C) general · D) other → **Choice: B (mothers & children)**
- **Goal options:** A) sales · B) WhatsApp orders · C) leads · D) brand image → **Choice: B (WhatsApp orders)**
- **Languages options:** A) FR · B) AR-RTL · C) EN · D) multi → **Choice: FR + AR (custom, = D-style bilingual)**
- **Shop options:** A) cart + checkout + COD · B) showcase only → **Choice: A, but checkout hands off to WhatsApp**
- **Extra requirement:** backend + admin dashboard for orders
- **Assets options:** A) all · B) some · C) nothing → **Choice: C (logo only) + talwine.com as visual reference**
- **Reason:** real WhatsApp-ordering shop for a Moroccan kids brand, bilingual, with an admin panel.

## 3. 2026-10-08 | Step 2 — References
- **Reference given:** https://talwine.com/ (analysis in REFERENCES.md REF-1)
- **User:** "M3andich saraha" — no other references. Fallback applied → 3 style directions with previews.
- **Extracted from live CSS:** font Inter/Inter, bg #f6f1ec, button #6bb4ab, peach #fde7da/#f69961, radius 6px / card 0.6rem.

## 4. 2026-10-08 | Step 3 — Style direction (mood-boards)
- **Files:** `/previews/step3/option-a.html` (Cozy Chaleureux), `option-b.html` (Playful Candy), `option-c.html` (Clean Soft Minimal)
- **Options:** A) Cozy warm pastel · B) Playful Candy · C) Clean minimal
- **Choice:** **B — Playful Candy**
- **Reason:** playful, energetic kids-brand identity; still keeps all talwine sections.
- **Note:** does NOT match reference palette (flagged to user in the option description: "s'éloigne du site de référence"). User picked it anyway → reference is used for STRUCTURE/sections only, not for colors.

## 5. 2026-10-08 | Step 4.1 — Color palette
- **Files:** `/previews/step4/option-a.html` (Bubblegum Pop), `option-b.html` (Tropical Splash), `option-c.html` (Soft Candy Pastel)
- **Options:** A) Bubblegum Pop · B) Tropical Splash · C) Soft Candy Pastel
- **Choice:** **A — Bubblegum Pop**
- **Reason:** strongest contrast, clearest headings/buttons, closest to the chosen mood-board.
- **Locked colors:**
  - bg `#FFFDF7` · ink `#25235B` · ink-soft `#5B5986`
  - primary `#FF6B9D` · primary-strong `#E8457F` (buttons)
  - secondary `#2EC4B6` · secondary-strong `#1B9A8E` (announcement / WhatsApp)
  - highlight `#FFD166` · tertiary `#A78BFA`
  - line `rgba(37,35,91,.14)` · hard pop shadow `0 5px 0 #25235B`
  - success/green badge: TBD (used `#1FDA25` in ref)

## 6. 2026-10-08 | Step 4.2 — Typography
- **Files:** `/previews/step4.2/option-a.html` (Fredoka+Nunito+Cairo), `option-b.html` (Baloo 2+Nunito Sans+Tajawal), `option-c.html` (Poppins+Inter+IBM Plex Sans Arabic)
- **Options:** A) Fredoka/Cairo · B) Baloo 2/Tajawal · C) Poppins/IBM Plex Sans Arabic
- **Choice:** **B — Baloo 2 (headings) + Nunito Sans (body) + Tajawal (Arabic)**
- **Reason:** chunky kid-friendly headlines, readable French body, modern Arabic with matching weight.
- **Source:** Google Fonts (free, fast, system fallback).

## 7. 2026-10-08 | Step 4.3 — UI kit
- **Files:** `/previews/step4.3/option-a.html` (Chunky Pop), `option-b.html` (Soft & Rounded), `option-c.html` (Sticker Flat)
- **Options:** A) Chunky Pop · B) Soft & Rounded · C) Sticker Flat
- **Choice:** **A — Chunky Pop**
- **Reason:** consistent with the Playful Candy direction, clear affordance on click, still readable in FR + AR forms.
- **Locked:** pill buttons `999px` + hard shadow `0 5px 0 #25235B` (pressed = +4px) · cards `20px` + `2px` border · inputs `14px` + focus `0 4px 0` · badges pill 10px/800 uppercase · alerts green/yellow/pink.
- **Step 4 COMPLETE** → DESIGN_SYSTEM.md fully locked.

## 8. 2026-10-08 | Step 5.1 — Sitemap
- **Options:** A) Full shop 17 pages · B) Lean shop 9 pages · C) Shop + content 20 pages
- **Choice:** **B — Lean shop (9 pages)**
- **Pages:** `/` · `/shop` · `/product/:slug` · `/cart` · `/checkout` (→ WhatsApp) · `/about` · `/contact` · `/faq` · `/404`
- **Notes:** categories = filters inside `/shop` (no category pages); privacy = footer section; search = header overlay.
- **Reason:** keeps the "many pages" feel while cutting content pages that add no conversion value now.

## 9. 2026-10-08 | Step 5.2 — Homepage section order
- **Options shown:** A) talwine order · B) trust-first order · C) brand-first order · user first replied "A and B"
- **Resolution:** flagged that A ⊂ B; A+B = single sequence. Options re-issued: A) merge · B) A only · C) B only
- **Choice:** **A — the merged 12-step sequence** (= B, locked)
- **Order:** announcement → navbar → hero → trust strip → promo pack → categories → new products → best-sellers → testimonials → FAQ → WhatsApp CTA → footer
- **Reason:** keeps the reference's flow while adding trust signals + WhatsApp conversion block.

## 10. 2026-10-08 | Step 5.3 — Navbar layout
- **Files:** `/previews/step5.3/option-a.html` (Barre classique), `option-b.html` (Recherche + mega-menu), `option-c.html` (Bandeau flottant)
- **Choice:** **A — Barre classique** (announcement bar · logo left · nav center · icons right: search, FR/عربي, cart w/ badge, WhatsApp CTA · mobile = side drawer + category column)
- **Reason:** clearest and closest to the talwine reference the user wants to match.
- **Follow-up requested by user:** compare 3 icon libraries → see DECISIONS #11.

## 11. 2026-10-08 | Step 5.4 — Icon library
- **Files:** `/previews/step5.4/option-a.html` (Lucide), `option-b.html` (Phosphor), `option-c.html` (Font Awesome 6 Free)
- **Options:** A) Lucide · B) Phosphor · C) Font Awesome 6
- **Choice:** **B — Phosphor** (`@phosphor-icons/web` / `@phosphor-icons/react`)
- **Reason:** rounded shapes fit Playful Candy; two weights (bold + fill) give hierarchy; WhatsApp icon included natively.
- **Verified CDN:** `https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/{bold,fill}/style.css`, usage `<i class="ph-bold ph-magnifying-glass">`.
- **Note:** previews load via CDN; real install happens in Step 8.

## 12. 2026-10-08 | Step 5.5 — Hero layout
- **Files:** `/previews/step5.5/option-a.html` (image plein cadre), `option-b.html` (split + collage), `option-c.html` (bloc couleur + 3 produits)
- **Choice:** **B — Split texte / collage**
- **Reason:** balanced copy vs visual, needs only 4 small photos (user has none yet), age chips give direct category access.
- **Icons used in previews:** Phosphor (`ph-bold` + `ph-fill`), consistent with DECISIONS #11.

## 13. 2026-10-08 | Step 5.6 — Trust strip (§4) + Promo pack (§5)
- **Files:** `/previews/step5.6/option-a.html` (bande sobre + carte horizontale), `option-b.html` (cercles + bande pleine largeur), `option-c.html` (ticker jaune + double carte)
- **Choice:** **A — bande sobre 4 blocs + carte promo horizontale**
- **Reason:** keeps the page clean after the hero, does not compete with it for color, horizontal card reads well on mobile.

## 14. 2026-10-08 | Step 5.7 — Category tiles (§6)
- **Files:** `/previews/step5.7/option-a.html` (grille 4 tuiles), `option-b.html` (carrousel), `option-c.html` (mosaïque bento)
- **Choice:** **C — Mosaïque asymétrique (bento)**
- **Reason:** colour-coded tiles double as decoration; best-selling category gets a dominant tile; strongest brand identity.

## 15. 2026-10-08 | Step 5.8 — Product grid (§7 + §8)
- **Files:** `/previews/step5.8/option-a.html` (grille classique), `option-b.html` (ajout rapide au survol + filtres), `option-c.html` (produit vedette + grille)
- **Choice:** **A — grille classique 4 colonnes**
- **Reason:** mirrors the reference's structure, add-to-cart button always visible on mobile, easiest to generate from the product list.
- **Card spec:** image (4:3) → badges (PROMO / NOUVEAU / ÉPUISÉ) → heart → title FR + AR → stars + count → price + struck price → button.

## 16. 2026-10-08 | Step 5.9 — Testimonials (§9)
- **Files:** `/previews/step5.9/option-a.html` (note globale + 3 cartes), `option-b.html` (témoignage vedette), `option-c.html` (carrousel photos clients)
- **Choice:** **A — note globale + 3 cartes d'avis**
- **Reason:** immediate trust (score + distribution bars + "Achat vérifié"), clearest on mobile, matches the reference's block.
- **Review card spec:** stars + "✓ Achat vérifié" (green) → quote (FR or AR) → initial avatar + prénom + ville + date.

## 17. 2026-10-08 | Step 5.10 — FAQ (§10)
- **Files:** `/previews/step5.10/option-a.html` (accordéon simple centré), `option-b.html` (image + accordéon), `option-c.html` (filtres + 2 colonnes)
- **Choice:** **A — accordéon simple centré**
- **Reason:** le plus clair, le moins de maintenance, et il transforme la FAQ en canal de vente via le bouton WhatsApp final.
- **FAQ spec:** titre FR + AR → 5 questions (FR + AR sur chaque ligne) → pastille +/− rose, 1ʳᵉ ouverte → bloc final « pas de réponse ? → WhatsApp ».

## 18. 2026-10-08 | Step 5.11 — CTA WhatsApp (§11)
- **Files:** `/previews/step5.11/option-a.html` (bande ensoleillée), `option-b.html` (barre fixe bas), `option-c.html` (3 étapes de commande)
- **Choice:** **C — « commander en 30 secondes » (3 étapes)**
- **Reason:** convertit en levant le doute « ça a l'air compliqué » : lien → adresse → paiement à la réception, avec un seul bouton vert final.
- **CTA spec:** badge « PAS DE COMPTE À CRÉER » (jaune) → titre FR + AR → 3 cartes numérotées (1 rose / 2 ambre / 3 sarcelle, icônes Phosphor) → bouton vert WhatsApp + ombre pleine décalée `6px 6px 0 #25235B` → note FR + AR sous le bouton.

## 19. 2026-10-08 | Step 5.12 — Footer (§12)
- **Files:** `/previews/step5.12/option-a.html` (4 colonnes), `option-b.html` (newsletter + SAKINA géant), `option-c.html` (accordéons compacts)
- **Choice:** **B — newsletter « −10 % » + mot géant SAKINA**
- **Reason:** la newsletter devient le héros du footer (raison concrète de laisser son email), et le mot en filigrane ancre l'identité sans image.
- **Footer spec:** fond `#25235B` → gauche : « −10 % sur votre 1ʳᵉ commande » FR + AR + champ email + bouton jaune · droite : 2 colonnes de liens (Boutique / Aide) → rangée : 3 icônes sociales + bouton vert WhatsApp + ville/horaires → SAKINA en filigrane `rgba(255,255,255,.07)` → barre légale (© + Mentions légales + Confidentialité + CGV).

## 20. 2026-10-08 | Step 8 (early) — Tech stack
- **Choice:** **Next.js (App Router) + Supabase** — user: « ana ghadi na5dam b supabase o next js »
- **Reason:** user already plans this stack → the catalogue is DB-driven (Postgres) instead of a static `products.json`.
- **Implications:** tables `products` / `categories` with RLS read-only anon, Storage for images, cart in client state → WhatsApp checkout, FR/AR dictionary + RTL. Full spec in `TECH_STACK.md`.

## 21. 2026-10-08 | Step 6 - Catalogue schema
- **Choice:** **A - simple (2 tables)** : `categories` + `products` (slug, prix, stock, badge, images, description FR/AR). Pas de variantes, pas de table orders en v1.
- **Reason:** start fast on Next.js + Supabase, upgrade to B/C later without rewriting (RLS read-only anon for catalogue).
- **Pending:** WhatsApp message format (i short / ii structured).

## 22. 2026-10-08 | Step 6 (bis) - WhatsApp checkout message
- **Choice:** **ii structured + bilingual** : meme message d'abord en ARABE, puis en FRANCAIS en dessous (deux blocs dans un seul message WhatsApp).
- **Format:** liste des articles (qte x nom, prix, sous-total) + Total + Ville + Adresse + Tel -> une seule action Envoyer.
- **Example:**
  AR: طلب جديد من ساكينا:
     - 2x peluche ours - 129 DH
     المجموع: 258 DH
     المدينة: الدار البيضاء
     الاسم: ... / الهاتف: ...
  FR: Nouvelle commande Sakina:
     - 2x peluche ours - 129 DH
     Total: 258 DH
     Ville: Casablanca / Nom ... / Tel ...

## 23. 2026-10-08 | Step 7 - Content
- **Choice:** **A + i** - full copy FR + AR written by the assistant (playful tone, mothers & kids) + 20-30 realistic placeholder products (Unsplash images) seeded into Supabase.
- **Reason:** the site is shown complete; the user later swaps in real products (same schema).

## 24. 2026-10-09 | Images from the web
- **Choice:** replace local SVG placeholders with real web images (user: "use images from web").
- **Source:** Openverse API (commercial-license only), rawpixel/Flickr/Wikimedia hosts; curated + visually verified per product (`scripts/fetch-images.mjs` + `scripts/set-images.mjs`), stored in `data/catalog.json` `image` field; local SVG stays as fallback.
- **Config:** `next.config.ts` remotePatterns allows images.unsplash.com, live.staticflickr.com, images.rawpixel.com, upload.wikimedia.org.
