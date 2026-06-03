import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RIVISIG Consultores — Capacitación ISO",
    short_name: "RIVISIG",
    description:
      "Plataforma de capacitación y consultoría en Sistemas de Gestión ISO. Cursos certificados con código verificable.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "es-PE",
    theme_color: "#dc2626",
    background_color: "#ffffff",
    categories: ["education", "business", "productivity"],
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
