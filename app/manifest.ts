import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sakina — Planners, Carnets de recettes, Livres de coloriage, mugs et gourdes",
    short_name: "Sakina",
    description:
      "Planners inspirants • Carnets de recettes gourmands • Livres de coloriage relaxants • mugs et gourdes Isotherme",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfbf6",
    theme_color: "#fcfbf6",
    icons: [
      { src: "/icon.png", sizes: "64x64", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
