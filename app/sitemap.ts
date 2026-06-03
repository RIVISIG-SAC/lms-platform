import type { MetadataRoute } from "next";
import { getBlogSitemapEntries } from "@/lib/queries/blog";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/cursos", changeFrequency: "daily", priority: 0.9 },
  { path: "/servicios", changeFrequency: "monthly", priority: 0.8 },
  { path: "/metodologia", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/verificar", changeFrequency: "yearly", priority: 0.4 },
  { path: "/terminos-y-condiciones", changeFrequency: "yearly", priority: 0.3 },
  { path: "/politica-de-privacidad", changeFrequency: "yearly", priority: 0.3 },
];

const getPublishedCoursesForSitemap = unstable_cache(
  async () => {
    return prisma.course.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
    });
  },
  ["sitemap-courses"],
  { revalidate: 3600, tags: ["sitemap"] },
);

const getBlogCategoriesForSitemap = unstable_cache(
  async () => {
    return prisma.blogCategory.findMany({
      select: { slug: true },
      orderBy: { name: "asc" },
    });
  },
  ["sitemap-blog-categories"],
  { revalidate: 3600, tags: ["blog-categories"] },
);

const getInstructorsForSitemap = unstable_cache(
  async () => {
    return prisma.instructorProfile.findMany({
      where: {
        courses: { some: { published: true } },
      },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  },
  ["sitemap-instructors"],
  { revalidate: 3600, tags: ["sitemap"] },
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const [posts, courses, categories, instructors] = await Promise.all([
    getBlogSitemapEntries(),
    getPublishedCoursesForSitemap(),
    getBlogCategoriesForSitemap(),
    getInstructorsForSitemap(),
  ]);

  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt ?? p.publishedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const courseEntries: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${SITE_URL}/cursos/${c.id}`,
    lastModified: c.updatedAt ?? c.createdAt ?? now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/blog?cat=${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const instructorEntries: MetadataRoute.Sitemap = instructors.map((i) => ({
    url: `${SITE_URL}/instructores/${i.id}`,
    lastModified: i.updatedAt ?? now,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticEntries,
    ...courseEntries,
    ...blogEntries,
    ...categoryEntries,
    ...instructorEntries,
  ];
}
