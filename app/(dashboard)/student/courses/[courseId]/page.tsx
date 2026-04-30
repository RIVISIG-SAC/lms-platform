import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { VimeoPlayer } from "@/components/student/VimeoPlayer";
import { ChapterSidebar } from "@/components/student/ChapterSidebar";
import { MarkCompleteButton } from "@/components/student/MarkCompleteButton";
import { InstructorCard } from "@/components/instructor/InstructorCard";

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
  const nextChapter = allChapters[activeIndex + 1] ?? null;

  return (
    <>
      <ChapterSidebar
        modules={course.modules}
        currentChapterId={activeChapter.id}
        completedIds={completedIds}
        courseId={courseId}
        progressPercentage={enrollment.progressPercentage}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* Enrolled banner */}
          {enrolled === "1" && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
              ¡Inscripción exitosa! Ahora tienes acceso completo a este curso por 180 días.
            </div>
          )}

          {/* Video or placeholder */}
          {activeChapter.vimeoVideoId ? (
            <VimeoPlayer
              videoId={activeChapter.vimeoVideoId}
              title={activeChapter.title}
            />
          ) : (
            <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-[var(--muted-foreground)]">
                <span className="text-4xl block mb-2">📄</span>
                <p className="text-sm">Este capítulo no tiene video</p>
              </div>
            </div>
          )}

          {/* Chapter info */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {activeChapter.title}
              </h2>
              <MarkCompleteButton
                chapterId={activeChapter.id}
                courseId={courseId}
                nextChapterId={nextChapter?.id ?? null}
                isDone={completedIds.has(activeChapter.id)}
              />
            </div>

            {activeChapter.content && (
              <div className="prose prose-sm max-w-none text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap border-t border-[var(--border)] pt-4">
                {activeChapter.content}
              </div>
            )}

            {activeChapter.resources.length > 0 && (
              <div className="border-t border-[var(--border)] pt-4 space-y-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">
                  Recursos descargables
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeChapter.resources.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-[var(--border)] hover:bg-slate-50 transition-colors text-[var(--foreground)]"
                    >
                      <span className="text-base">
                        {r.type === "PDF" ? "📄" : r.type === "PPTX" ? "📊" : r.type === "DOCX" ? "📝" : r.type === "XLSX" ? "📋" : "📎"}
                      </span>
                      <span>{r.name}</span>
                      <span className="text-[10px] uppercase text-[var(--muted-foreground)] font-medium">{r.type}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructor */}
          {course.instructor && (
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Instructor del curso
              </h3>
              <InstructorCard
                instructorId={course.instructor.id}
                name={course.instructor.user.name}
                title={course.instructor.title}
                bio={course.instructor.bio}
                avatarUrl={course.instructor.avatarUrl}
                linkedin={course.instructor.linkedin}
                website={course.instructor.website}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-[var(--border)]">
            {activeIndex > 0 ? (
              <a
                href={`/student/courses/${courseId}?chapter=${allChapters[activeIndex - 1].id}`}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1"
              >
                ← {allChapters[activeIndex - 1].title}
              </a>
            ) : (
              <div />
            )}
            {nextChapter && (
              <a
                href={`/student/courses/${courseId}?chapter=${nextChapter.id}`}
                className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                {nextChapter.title} →
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
