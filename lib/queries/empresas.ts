import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const companyCardSelect = {
  id: true,
  name: true,
  slug: true,
  sector: true,
  logoUrl: true,
  heroImageUrl: true,
  heroTitle: true,
  publishedAt: true,
} as const;

export const getPublishedCompanies = unstable_cache(
  async () => {
    return prisma.company.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        noIndex: false,
      },
      orderBy: { publishedAt: "desc" },
      select: companyCardSelect,
    });
  },
  ["companies-published"],
  { revalidate: 60, tags: ["companies"] },
);

export const getFeaturedCompany = unstable_cache(
  async () => {
    return prisma.company.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        noIndex: false,
      },
      orderBy: { publishedAt: "desc" },
      select: companyCardSelect,
    });
  },
  ["companies-featured"],
  { revalidate: 60, tags: ["companies"] },
);

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    include: {
      facts: { orderBy: { order: "asc" } },
      services: { orderBy: { order: "asc" } },
      achievements: { orderBy: { order: "asc" } },
      awards: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
      images: { orderBy: { order: "asc" } },
    },
  });
}

export async function getCompaniesSitemapEntries() {
  return prisma.company.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      noIndex: false,
    },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}
