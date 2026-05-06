import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { CoursePlayerClient } from "@/components/student/CoursePlayerClient";

type Props = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ chapter?: string; enrolled?: string }>;
};

export default async function CoursePlayerPage({ params, searchParams }: Props) {
  const { courseId } = await params;
  const { chapter: chapterParam, enrolled } = await searchParams;
  const session = await getRequiredSession();

  const [course, enrollment] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            chapters: {
              orderBy: { order: "asc" },
              select: {
                id: true, title: true, vimeoVideoId: true, content: true, order: true,
                resources: { select: { id: true, name: true, url: true, type: true }, orderBy: { createdAt: "asc" } },
              },
            },
          },
        },
        instructor: {
          include: { user: { select: { name: true } } },
        },
      },
    }),
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId } },
      include: { chapterProgress: { select: { chapterId: true } } },
    }),
  ]);

  if (!course || !enrollment) notFound();

  // Flatten chapters in order
  const allChapters = course.modules.flatMap((m) => m.chapters);
  if (allChapters.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--muted-foreground)]">
        Este curso no tiene contenido todavía.
      </div>
    );
  }

  const completedIds = new Set(enrollment.chapterProgress.map((p) => p.chapterId));

  // Determinar capítulo activo: query param → primer incompleto → primero
  const activeChapter =
    allChapters.find((ch) => ch.id === chapterParam) ??
    allChapters.find((ch) => !completedIds.has(ch.id)) ??
    allChapters[0];

  const activeIndex = allChapters.findIndex((ch) => ch.id === activeChapter.id);

  return (
    <CoursePlayerClient
      courseId={courseId}
      modules={course.modules}
      progressPercentage={enrollment.progressPercentage}
      activeChapter={{
        id: activeChapter.id,
        title: activeChapter.title,
        vimeoVideoId: activeChapter.vimeoVideoId,
        content: activeChapter.content,
        resources: activeChapter.resources,
      }}
      completedChapterIds={Array.from(completedIds)}
      allChapters={allChapters.map((ch) => ({ id: ch.id, title: ch.title }))}
      activeIndex={activeIndex}
      instructor={
        course.instructor
          ? {
              id: course.instructor.id,
              name: course.instructor.user.name,
              title: course.instructor.title,
              bio: course.instructor.bio,
              avatarUrl: course.instructor.avatarUrl,
              linkedin: course.instructor.linkedin,
              website: course.instructor.website,
            }
          : null
      }
      enrolledBanner={enrolled === "1"}
    />
  );
}
