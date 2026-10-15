/**
 * Seed homepage hero slides with real example content.
 * Usage: node --env-file=.env.local scripts/seed-slides.mjs
 * Upserts the `hero_slides` settings key — same storage the admin edits,
 * so backups/restores and the admin panel stay in sync. Safe to re-run.
 */
import pg from "pg";

const slides = [
  {
    id: "seed-1",
    image: "/img/products/plaid-chenille-150x200.jpg",
    title_fr: "La douceur du plaid chenille",
    title_ar: "دفء بطانية الشينيل",
    text_fr: "150×200 cm, lavable en machine, dense et douce. Le plaid qu'on ne quitte plus dès les premiers froids.",
    text_ar: "150×200 سم، قابلة للغسل، كثيفة وناعمة. البطانية التي لا تفارقك مع أول برد.",
    btn_label_fr: "Voir le plaid",
    btn_label_ar: "اكتشف البطانية",
    btn_href: "/product/plaid-chenille-150x200",
    btn2_label_fr: "Tout le décor",
    btn2_label_ar: "كل الديكور",
    btn2_href: "/shop?cat=maison-deco",
    active: true,
  },
  {
    id: "seed-2",
    image: "/img/products/agenda-2027-broche.jpg",
    title_fr: "Agenda 2027 — préparez votre année",
    title_ar: "أجندة 2027 —حضّر سنتك",
    text_fr: "Carnets, agendas et papeterie pour une année bien organisée.",
    text_ar: "كُراسات وأجندة وقرطاسية لسنة منظمة.",
    btn_label_fr: "Voir les agendas",
    btn_label_ar: "شاهد الأجندة",
    btn_href: "/shop?cat=bureau-papeterie",
    btn2_label_fr: "Nouveautés",
    btn2_label_ar: "وصل حديثاً",
    btn2_href: "/shop?sort=new",
    active: true,
  },
  {
    id: "seed-3",
    image: "/img/products/lampe-champignon-led.jpg",
    title_fr: "L'intérieur qui vous ressemble",
    title_ar: "بيت يشبهكم",
    text_fr: "Lampes, textiles, rangement et petits objets — la maison selon vous.",
    text_ar: "إضاءة ومنسوجات وتخزين وقطع صغيرة — البيت على طريقتكم.",
    btn_label_fr: "Découvrir la maison",
    btn_label_ar: "اكتشف البيت",
    btn_href: "/shop?cat=maison-deco",
    btn2_label_fr: "Meilleures ventes",
    btn2_label_ar: "الأكثر مبيعاً",
    btn2_href: "/shop?sort=best",
    active: true,
  },
];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Run: node --env-file=.env.local scripts/seed-slides.mjs");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: /(:5432|:6543)/.test(connectionString) ? { rejectUnauthorized: false } : undefined,
  statement_cache_size: 0,
});

try {
  await pool.query(
    `insert into public.settings (key, value, updated_at) values ('hero_slides', $1, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify(slides)]
  );
  console.log(`hero_slides upserted (${slides.length} slides).`);
} finally {
  await pool.end();
}
