import { prisma } from "@/lib/prisma";
import { toSlug } from "./slug-client";

export { toSlug };

/**
 * Devuelve un slug libre a partir de `base`, anadiendo -2, -3... si ya existe.
 * `excludeId` permite que un curso conserve su propio slug al editarlo.
 */
export async function ensureUniqueCourseSlug(base: string, excludeId?: string): Promise<string> {
  const root = toSlug(base) || "curso";
  let candidate = root;
  let counter = 2;

  while (true) {
    const existing = await prisma.course.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${root}-${counter++}`;
  }
}
