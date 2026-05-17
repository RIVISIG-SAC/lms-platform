import type { MetadataRoute } from "next";
import { getBlogSitemapEntries } from "@/lib/queries/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/cursos", changeFrequency: "weekly", priority: 0.9 },
  { path: "/servicios", changeFrequency: "monthly", priority: 0.8 },
  { path: "/metodologia", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/terminos-y-condiciones", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-de-privacidad", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const posts = await getBlogSitemapEntries();
  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt ?? p.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
