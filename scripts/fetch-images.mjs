import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "data/catalog.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

const KEYWORDS = {
  "puzzle-en-bois-36-pieces": "wooden puzzle",
  "cube-deveil-6-activites": "wooden toy blocks",
  "peluche-ours-bebe": "plush teddy bear toy",
  "tapis-deveil-musical": "baby play mat",
  "blocs-construction-50-pieces": "building blocks toy",
  "cheval-a-bascule-bois": "wooden rocking horse toy",
  "livre-activites-3-6-ans": "children activity book",
  "encyclopedie-enfants": "children books",
  "cahier-coloriage-animaux": "coloring book",
  "histoires-du-soir-lot-3": "storybook children",
  "premier-apprentissage-ar-fr": "alphabet learning book",
  "sac-a-dos-scolaire": "kids backpack",
  "trousse-double-zip": "pencil case",
  "kit-couleur-24-crayons": "colored pencils",
  "cahiers-grand-format-lot-5": "notebook stationery",
  "gommage-taille-crayon": "school stationery",
  "pack-naissance-bienvenue-bebe": "newborn baby gift",
  "coffret-anniversaire-enfant": "birthday gift box",
  "pack-rentree-scolaire": "school supplies",
  "body-coton-bio-lot-3": "baby bodysuit",
  "pyjama-garcon-2-ans": "kids pajamas",
  "robe-fille-fleurie": "kids dress",
  "chaussettes-bebe-lot-5": "baby socks",
  "casquette-enfant": "child cap hat",
};

const PREFS = {
  "peluche-ours-bebe": { include: ["teddy", "plush", "stuffed"], exclude: ["patrol"] },
  "cheval-a-bascule-bois": { include: ["rocking horse", "hobby horse", "wooden horse"], exclude: ["rodeo", "polo"] },
  "coffret-anniversaire-enfant": { include: ["wrapping", "wrapped", "gift box", "present"], exclude: ["price", "tag", "sale", "shelf", "display", "store", "grocery"] },
};

const REFRESH = new Set([]);

const QUERY_FALLBACKS = {
  "peluche-ours-bebe": ["teddy bear", "stuffed toy bear", "plush toy"],
  "cheval-a-bascule-bois": ["rocking horse", "wooden toy horse", "hobby horse toy"],
  "coffret-anniversaire-enfant": ["wrapped gift present", "gift wrapping ribbon", "present box"],
};

function matchesPref(r, pref) {
  const title = (r.title ?? "").toLowerCase();
  const incOk = pref.include.length === 0 || pref.include.some((k) => title.includes(k));
  const excOk = !pref.exclude.some((k) => title.includes(k));
  return incOk && excOk;
}

function parseLinkHeader(value) {
  const m = value?.match(/page=(\d+)>\s*;\s*rel="last"/);
  return m ? Number(m[1]) : 1;
}

async function headOk(url) {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    const ct = res.headers.get("content-type") ?? "";
    return res.status === 200 && ct.startsWith("image/");
  } catch {
    return false;
  }
}

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
      if (page >= (parseLinkHeader(res.headers.get("link")) || 1)) break;
    } catch {
      break;
    }
  }
  return out;
}

let changed = 0;
const hosts = new Set();

for (const product of catalog.products) {
  const query = KEYWORDS[product.slug];
  if (!query) {
    console.log(`skip (no keyword): ${product.slug}`);
    continue;
  }
  if (product.image && product.image.startsWith("http") && !REFRESH.has(product.slug)) {
    console.log(`keep: ${product.slug} -> ${product.image}`);
    hosts.add(new URL(product.image).hostname);
    continue;
  }

  const pref = PREFS[product.slug];
  const queries = QUERY_FALLBACKS[product.slug] ?? [query];
  let results = [];
  for (const q of queries) {
    results = results.concat(await search(q));
    if (pref && results.some((r) => matchesPref(r, pref))) break;
  }
  const ranked = pref ? results.filter((r) => matchesPref(r, pref)) : results;
  const candidates = ranked;

  if (candidates.length === 0) {
    console.log(`FAIL (no matching title): ${product.slug}`);
    continue;
  }

  let picked = null;
  for (const r of candidates.slice(0, 8)) {
    if (await headOk(r.url)) {
      picked = r;
      break;
    }
  }

  if (picked) {
    product.image = picked.url;
    hosts.add(new URL(picked.url).hostname);
    changed++;
    console.log(`OK: ${product.slug} -> ${picked.title?.slice(0, 40)} [${picked.url}]`);
  } else {
    console.log(`FAIL (keeping SVG fallback): ${product.slug}`);
  }
}

if (changed > 0) {
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n", "utf8");
}
console.log(`\n${changed} images updated. Hosts: ${[...hosts].join(", ")}`);
