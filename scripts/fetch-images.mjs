import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "data/catalog.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const outDir = join(root, "public/img/products");
mkdirSync(outDir, { recursive: true });

const KEYWORDS = {
  "lampe-champignon-led": "mushroom table lamp",
  "plaid-chenille-150x200": "soft throw blanket",
  "diffuseur-arome-bois": "reed diffuser",
  "miroir-rond-maxi": "round wall mirror",
  "cache-pot-terracotta": "terracotta plant pot",
  "panier-rangement-tresse": "woven storage basket",
  "sac-tote-coton-epais": "canvas tote bag",
  "casquette-brodee-classic": "baseball cap",
  "ceinture-cuir-simple": "leather belt",
  "lunettes-soleil-uv400": "sunglasses",
  "foulard-soie-matte": "silk scarf",
  "huile-argan-nuit": "cosmetic oil bottle",
  "parfum-musc-blanc-50ml": "perfume bottle",
  "brosse-visage-electrique": "facial cleansing brush",
  "coffret-soins-mains": "hand cream set",
  "masque-argile-verte": "face mask jar cosmetic",
  "ecouteurs-bt-anc": "wireless earbuds",
  "powerbank-10000mah": "power bank charger",
  "coque-silicone-universelle": "phone case",
  "support-portable-alu": "laptop stand",
  "carnet-couverture-lin-a5": "notebook journal",
  "stylo-plume-metal": "fountain pen",
  "agenda-2027-broche": "planner notebook",
  "set-rangement-bureau": "desk organizer",
};

const PREFS = {
  "masque-argile-verte": { include: ["mask", "clay"], exclude: ["halloween", "face painting", "ski"] },
  "coffret-soins-mains": { include: ["cream", "lotion", "hand", "care", "set", "kit"], exclude: ["glove", "sanitizer"] },
  "brosse-visage-electrique": { include: ["brush", "cleansing", "facial", "face"], exclude: ["hair", "makeup brush set", "paint"] },
  "support-portable-alu": { include: ["stand", "laptop", "notebook computer", "macbook"], exclude: ["book stand", "music"] },
  "plaid-chenille-150x200": { include: ["blanket", "throw", "duvet", "bedspread"], exclude: ["baby", "packaging"] },
};

const QUERY_FALLBACKS = {
  "lampe-champignon-led": ["table lamp", "mushroom lamp", "led lamp"],
  "diffuseur-arome-bois": ["aroma diffuser", "reed diffuser", "fragrance diffuser"],
  "cache-pot-terracotta": ["flower pot", "plant pot", "terracotta pot"],
  "panier-rangement-tresse": ["basket", "wicker basket", "laundry basket"],
  "huile-argan-nuit": ["oil bottle", "serum bottle", "cosmetic bottle"],
  "brosse-visage-electrique": ["cleansing brush", "face brush", "beauty device"],
  "coffret-soins-mains": ["hand cream", "cosmetic set", "beauty set"],
  "masque-argile-verte": ["clay mask", "face mask", "cosmetic jar"],
  "powerbank-10000mah": ["power bank", "portable charger", "battery pack"],
  "coque-silicone-universelle": ["phone case", "smartphone case", "mobile cover"],
  "support-portable-alu": ["laptop stand", "notebook stand", "computer stand"],
  "carnet-couverture-lin-a5": ["notebook", "journal", "notepad"],
  "stylo-plume-metal": ["fountain pen", "ink pen", "writing pen"],
  "agenda-2027-broche": ["planner", "agenda diary", "calendar notebook"],
  "set-rangement-bureau": ["desk organizer", "pen holder", "office organizer"],
};

async function search(query, pages = 2) {
  const out = [];
  for (let page = 1; page <= pages; page++) {
    const api =
      `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}` +
      `&page_size=12&page=${page}&license_type=commercial&extension=jpg&mature=false`;
    try {
      const res = await fetch(api, {
        headers: { "User-Agent": "sakina-dev/1.0" },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) break;
      const data = await res.json();
      for (const r of data.results ?? []) {
        if (r.url && (r.width ?? 0) >= 600) out.push(r);
      }
      const link = res.headers.get("link") ?? "";
      const m = link.match(/page=(\d+)>\s*;\s*rel="last"/);
      if (page >= (m ? Number(m[1]) : 1)) break;
    } catch {
      break;
    }
  }
  return out;
}

function matchesPref(r, pref) {
  const title = (r.title ?? "").toLowerCase();
  const incOk = pref.include.length === 0 || pref.include.some((k) => title.includes(k));
  const excOk = !pref.exclude.some((k) => title.includes(k));
  return incOk && excOk;
}

async function download(url, destPath) {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(30000),
    headers: { "User-Agent": "sakina-dev/1.0" },
  });
  if (!res.ok) return false;
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.startsWith("image/")) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) return false;
  writeFileSync(destPath, buf);
  return true;
}

let changed = 0;
let failed = 0;

for (const product of catalog.products) {
  const query = KEYWORDS[product.slug];
  if (!query) {
    console.log(`skip (no keyword): ${product.slug}`);
    continue;
  }
  const localPath = `/img/products/${product.slug}.jpg`;
  const dest = join(outDir, `${product.slug}.jpg`);
  if (product.image === localPath) {
    console.log(`keep: ${product.slug}`);
    continue;
  }

  const pref = PREFS[product.slug];
  const queries = QUERY_FALLBACKS[product.slug] ?? [query];
  let results = [];
  for (const q of queries) {
    results = results.concat(await search(q));
    if (pref && results.some((r) => matchesPref(r, pref))) break;
  }
  const candidates = pref ? results.filter((r) => matchesPref(r, pref)) : results;
  if (candidates.length === 0) {
    console.log(`FAIL (no results): ${product.slug}`);
    failed++;
    continue;
  }

  let ok = false;
  for (const r of candidates.slice(0, 8)) {
    if (await download(r.url, dest)) {
      product.image = localPath;
      changed++;
      ok = true;
      console.log(`OK: ${product.slug} <- ${r.title?.slice(0, 50)}`);
      break;
    }
  }
  if (!ok) {
    console.log(`FAIL (download): ${product.slug}`);
    failed++;
  }
}

if (changed > 0) {
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
}
console.log(`\n${changed} downloaded, ${failed} failed.`);
