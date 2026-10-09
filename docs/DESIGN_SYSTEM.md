# DESIGN SYSTEM

Status: **Step 4 COMPLETE — tokens locked (2026-10-08)**

## Approved direction
- **Style:** **B — Playful Candy** (DECISIONS #4)

## 1. Colors (LOCKED — DECISIONS #5, preview `/previews/step4/option-a.html`)
| Token | Hex | Use |
|---|---|---|
| `--bg` | `#FFFDF7` | page background (milk) |
| `--ink` | `#25235B` | headings, body, dark surfaces, footer |
| `--ink-soft` | `#5B5986` | secondary text, meta, placeholders |
| `--pink` | `#FF6B9D` | decorative / hover accents |
| `--primary-strong` | `#E8457F` | primary buttons, badges, links, price highlights |
| `--teal` | `#2EC4B6` | large colored surfaces, section blocks |
| `--secondary-strong` | `#1B9A8E` | announcement bar, secondary buttons, WhatsApp block |
| `--highlight` | `#FFD166` | yellow badges, image placeholders, star blocks |
| `--tertiary` | `#A78BFA` | tertiary badges / category tiles |
| `--green` | `#1FDA25` | WhatsApp / success (text `#0b3d10`) |
| `--line` | `rgba(37,35,91,.16)` | borders |

Gradients (hero): `linear-gradient(120deg,#FFE3EE 0%,#FFF3CF 50%,#D6F5F2 100%)`

## 2. Typography (LOCKED — DECISIONS #6, preview `/previews/step4.2/option-b.html`)
- **Headings (FR):** `Baloo 2` — 800 (H1 54/58), 700 (H2 32/36), 600 (buttons)
- **Body (FR):** `Nunito Sans` — 400 (16/26), 700 (labels), 800 (prices 18)
- **Arabic (AR):** `Tajawal` — 400 / 500 / 700, always `direction: rtl`
- **Source:** Google Fonts + system fallback
- Scale: H1 54–60 · H2 30–32 · H3 22 · body 16 · small 14 · meta 12–13 · button 14–15
- Price: Nunito Sans 800, `149,00 dh` format (comma decimal, `dh` suffix)

## 3. UI kit (LOCKED — DECISIONS #7, preview `/previews/step4.3/option-a.html` = "Chunky Pop")
- **Radius:** buttons/badges `999px` (pill) · cards `20px` · inputs `14px` · images `16px`
- **Shadow:** hard pop `0 5px 0 var(--ink)` on primary buttons; pressed state `translateY(4px)` + `0 1px 0`
- **Borders:** `2px solid var(--line)` on cards/inputs; `2px solid var(--ink)` on outline buttons
- **Buttons:** primary = pink-s fill + white; secondary = teal-s fill; tertiary = highlight fill + ink; outline = white + line; disabled = 40% opacity
- **Inputs:** white bg, 2px line border, focus = ink border + `0 4px 0 rgba(37,35,91,.15)`; error = pink-s border + pink-s helper text
- **Badges (chip):** pill, 10px, 800 weight, uppercase, letter-spacing .06em
- **Product card:** white, 2px border, 20px radius, image 4:3, title FR + AR, rating 11px, price 800, CTA button full-width
- **Alerts:** success `#E9FBF3` + `#1FDA25` border · warning `#FFF6E0` + `--highlight` · error `#FFEAF1` + pink-s
- **WhatsApp block:** teal surface, white text, green CTA button

## 4. Spacing & breakpoints
- Container: `max-w-6xl` (1152px), padding `16px` mobile / `24px` desktop
- Section rhythm: `py-10` mobile / `py-16` desktop
- Grids: products `2 cols → 4 cols`; blocks `1 → 2 → 3`
- Breakpoints (Tailwind): `sm 640 · md 768 · lg 1024 · xl 1280`

## 5. Animation rules
- TBD (Step 9 block 5) — options will be previewed.

## 6. Language / RTL rules
- FR = LTR, AR = RTL (`.ar { direction: rtl; font-family: Tajawal }`)
- Language switch in header, mobile drawer, and footer
- No fixed `left/right` utilities without RTL counterpart

## Notes
- Reference `talwine.com` contributes **structure/sections only** (REFERENCES.md), not colors.
