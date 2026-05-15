import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  coverImageUrl: true,
  publishedAt: true,
  createdAt: true,
  category: { select: { id: true, name: true, slug: true } },
  author: { select: { id: true, name: true } },
  tags: {
    select: {
      tag: { select: { id: true, name: true, slug: true } },
    },
  },
} as const;

export const getPublishedBlogPosts = unstable_cache(
  async () => {
    return prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        noIndex: false,
      },
      orderBy: { publishedAt: "desc" },
      select: postCardSelect,
    });
  },
  ["blog-published-posts"],
  { revalidate: 60, tags: ["blog-posts"] },
);

export const getFeaturedBlogPost = unstable_cache(
  async () => {
    return prisma.blogPost.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        noIndex: false,
      },
      orderBy: { publishedAt: "desc" },
      select: postCardSelect,
    });
  },
  ["blog-featured-post"],
  { revalidate: 60, tags: ["blog-posts"] },
);

export async function getBlogPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    include: {
      author: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, slug: true } },
      tags: {
        select: { tag: { select: { id: true, name: true, slug: true } } },
      },
    },
  });
}

export async function getRelatedBlogPosts(postId: string, categoryId: string | null, limit = 3) {
  if (!categoryId) {
    return prisma.blogPost.findMany({
      where: {
        id: { not: postId },
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        noIndex: false,
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: postCardSelect,
    });
  }

  return prisma.blogPost.findMany({
    where: {
      id: { not: postId },
      categoryId,
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      noIndex: false,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: postCardSelect,
  });
}

export const getBlogCategories = unstable_cache(
  async () => {
    return prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
  },
  ["blog-categories"],
  { revalidate: 300, tags: ["blog-categories"] },
);

export const getBlogTags = unstable_cache(
  async () => {
    return prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
  },
  ["blog-tags"],
  { revalidate: 300, tags: ["blog-tags"] },
);

export async function getBlogSitemapEntries() {
  return prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      noIndex: false,
    },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: "desc" },
  });
}
