import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sakina — Jouets, éveil & école",
    short_name: "Sakina",
    description:
      "Une sélection courte et vérifiée : jouets, livres, école et bébé. Paiement à la livraison partout au Maroc.",
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
