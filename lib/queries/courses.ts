import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

const courseSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  price: true,
  isFree: true,
  certificateFee: true,
  thumbnailUrl: true,
  category: true,
  level: true,
  durationHours: true,
  _count: { select: { modules: true } },
  modules: {
    select: { _count: { select: { chapters: true } } },
  },
  instructor: {
    select: {
      id: true,
      avatarUrl: true,
      user: { select: { name: true } },
    },
  },
} as const;

export const getFeaturedCourses = unstable_cache(
  async () => {
    return prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: courseSelect,
    });
  },
  // El sufijo -v2 corta con los snapshots cacheados antes de que el select
  // incluyera `slug`: sin el, el catalogo enlazaba a /cursos/undefined tras el
  // deploy, porque el Data Cache sobrevive a los despliegues.
  ['featured-courses-v2'],
  { revalidate: 3600, tags: ['courses'] },
);

export const getPublishedCourses = unstable_cache(
  async () => {
    return prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: courseSelect,
    });
  },
  ['published-courses-v2'],
  { revalidate: 3600, tags: ['courses'] },
);
