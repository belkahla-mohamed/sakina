import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sakina — Jouets, éveil & école",
    short_name: "Sakina",
    description:
      "Jouets d'éveil, livres, fournitures scolaires et vêtements bébé. Paiement à la livraison partout au Maroc.",
    start_url: "/",
    display: "standalone",
    background_color: "#25235b",
    theme_color: "#25235b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
