import slugify from "slugify";
import { prisma } from "@/lib/prisma";

export function toSlug(input: string): string {
  return slugify(input, {
    lower: true,
    strict: true,
    locale: "es",
    trim: true,
  });
}

export async function ensureUniqueBlogPostSlug(base: string, excludeId?: string): Promise<string> {
  const root = toSlug(base) || "post";
  let candidate = root;
  let counter = 2;

  while (true) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter++}`;
  }
}

export async function ensureUniqueBlogCategorySlug(base: string, excludeId?: string): Promise<string> {
  const root = toSlug(base) || "categoria";
  let candidate = root;
  let counter = 2;

  while (true) {
    const existing = await prisma.blogCategory.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter++}`;
  }
}

export async function ensureUniqueBlogTagSlug(base: string): Promise<string> {
  const root = toSlug(base) || "tag";
  let candidate = root;
  let counter = 2;

  while (true) {
    const existing = await prisma.blogTag.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${root}-${counter++}`;
  }
}
