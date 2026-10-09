import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "data/catalog.json");
const catalog = JSON.parse(readFileSync(path, "utf8"));

const PICKS = {
  "peluche-ours-bebe":
    "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2ZydGVkZHlfcGx1c2hfY3V0ZV90b3lzLWltYWdlLWt5YmFoajRyLmpwZw.jpg",
  "cheval-a-bascule-bois":
    "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2Zya29uaWtfdG95X21vZGVsXzEyOTEzMjYtaW1hZ2Uta3liYjg4aG0uanBn.jpg",
  "coffret-anniversaire-enfant":
    "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2ZyZ2lmdF9tYWRlX3BhY2thZ2VfbG9vcF8xOC1pbWFnZS1reWJka2V6aS5qcGc.jpg",
  "premier-apprentissage-ar-fr":
    "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvam9iNjc4LTA4OC1sMTJ1bDE4di5qcGc.jpg",
};

let n = 0;
for (const p of catalog.products) {
  if (PICKS[p.slug]) {
    p.image = PICKS[p.slug];
    n++;
  }
}
writeFileSync(path, JSON.stringify(catalog, null, 2) + "\n", "utf8");
console.log(`updated ${n} images`);
