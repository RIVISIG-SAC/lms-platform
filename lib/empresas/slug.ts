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

export async function ensureUniqueCompanySlug(base: string, excludeId?: string): Promise<string> {
  const root = toSlug(base) || "empresa";
  let candidate = root;
  let counter = 2;

  while (true) {
    const existing = await prisma.company.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter++}`;
  }
}
