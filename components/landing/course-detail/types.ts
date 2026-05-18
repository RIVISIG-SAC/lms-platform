import type { Prisma } from "@prisma/client";

export type CourseDetail = Prisma.CourseGetPayload<{
  include: {
    modules: {
      include: { chapters: { select: { id: true; title: true; vimeoVideoId: true } } };
    };
    _count: { select: { enrollments: true } };
    instructor: { include: { user: { select: { name: true } } } };
    faqs: true;
  };
}>;
