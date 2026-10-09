import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { categories, products } = JSON.parse(readFileSync(join(root, "data/catalog.json"), "utf8"));

const EMOJI = {
  puzzle: "🧩",
  book: "📚",
  backpack: "🎒",
  gift: "🎁",
  tshirt: "👕",
};

function mixWhite(hex, ratio) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const m = (c) => Math.round(c + (255 - c) * ratio);
  return `#${[m(r), m(g), m(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

const outDir = join(root, "public/img/products");
mkdirSync(outDir, { recursive: true });

for (const p of products) {
  const cat = categories.find((c) => c.slug === p.category);
  const base = cat?.color ?? "#FF6B9D";
  const light = mixWhite(base, 0.82);
  const mid = mixWhite(base, 0.45);
  const emoji = EMOJI[cat?.icon] ?? "🧸";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300" role="img" aria-label="${p.name_fr.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="100%" stop-color="${mid}"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#g)"/>
  <circle cx="330" cy="55" r="70" fill="${base}" opacity="0.35"/>
  <circle cx="60" cy="250" r="90" fill="#ffffff" opacity="0.35"/>
  <circle cx="200" cy="140" r="78" fill="#ffffff" opacity="0.85"/>
  <circle cx="200" cy="140" r="78" fill="none" stroke="${base}" stroke-width="4"/>
  <text x="200" y="172" font-size="72" text-anchor="middle">${emoji}</text>
  <text x="200" y="272" font-size="15" font-weight="700" text-anchor="middle" fill="#25235B" font-family="Arial, sans-serif" opacity="0.75">Sakina</text>
</svg>
`;
  writeFileSync(join(outDir, `${p.slug}.svg`), svg, "utf8");
}

console.log(`Wrote ${products.length} placeholders to public/img/products/`);
