import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/(auth)/",
          "/(dashboard)/",
          "/admin",
          "/student",
          "/instructor",
          "/registro",
          "/login",
          "/recuperar",
          "/verify-email",
          "/verificar/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
