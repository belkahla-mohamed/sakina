# Warm pastel per product photo -> lib/product-bgs.ts (generated map)
# Dominant color -> HSL -> warm bias + min chroma + capped lightness, so every
# card gets a visible tint that still belongs to the cream/brick brand.
import colorsys, os
from PIL import Image

ROOT = r"C:\Users\devmo\Documents\projects\sakina"
CAT = os.path.join(ROOT, "data", "catalog.json")
OUT = os.path.join(ROOT, "lib", "product-bgs.ts")

def clamp(x, lo, hi):
    return max(lo, min(hi, x))

def dominant(img_path):
    im = Image.open(img_path).convert("RGB")
    im.thumbnail((96, 96))
    px = list(im.getdata())
    hist, buckets = {}, {}
    for r, g, b in px:
        mx, mn = max(r, g, b), min(r, g, b)
        if mx > 242 and mx - mn < 14:  # near white
            continue
        if mx < 28:                    # near black
            continue
        key = (r >> 3, g >> 3, b >> 3)
        hist[key] = hist.get(key, 0) + 1
        buckets.setdefault(key, []).append((r, g, b))
    if not hist:
        n = len(px)
        return tuple(sum(p[i] for p in px) // n for i in range(3))
    key = max(hist, key=hist.get)
    members = buckets[key]
    n = len(members)
    return tuple(sum(p[i] for p in members) // n for i in range(3))

def to_pastel(rgb):
    r, g, b = (c / 255 for c in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)

    # Warm the hue: pull anything cool/neutral toward the sand hue (~30 deg).
    warm_h = 30 / 360
    if s < 0.16 or not (0.02 <= h <= 0.14):
        h = h * 0.35 + warm_h * 0.65 if s < 0.16 else h

    # Guarantee visible chroma, cap lightness, keep it pastel-not-slab.
    s = clamp(max(s, 0.10), 0.10, 0.24)
    l = clamp(l, 0.80, 0.90)

    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return "#{:02x}{:02x}{:02x}".format(
        clamp(round(r * 255), 0, 255),
        clamp(round(g * 255), 0, 255),
        clamp(round(b * 255), 0, 255),
    )

def main():
    import json
    catalog = json.load(open(CAT, encoding="utf-8"))
    rows = []
    for p in catalog["products"]:
        slug, img = p["slug"], p.get("image", "")
        path = os.path.join(ROOT, "public", img.lstrip("/"))
        if not img.startswith("/") or not os.path.isfile(path):
            continue
        rows.append((slug, to_pastel(dominant(path))))

    lines = [
        "/**",
        " * Soft backdrop tint per product, extracted from its photo (dominant",
        " * color, warmed and lightened into a pastel). Generated — do not edit",
        " * by hand; re-run the extraction when product images change.",
        " */",
        "export const PRODUCT_BGS: Record<string, string> = {",
    ]
    for slug, color in rows:
        lines.append(f'  "{slug}": "{color}",')
    lines.append("};")
    lines.append("")
    open(OUT, "w", encoding="utf-8").write("\n".join(lines))
    for slug, color in rows:
        print(f"{slug}: {color}")
    print(f"\nwrote {len(rows)} colors -> lib/product-bgs.ts")

if __name__ == "__main__":
    main()
