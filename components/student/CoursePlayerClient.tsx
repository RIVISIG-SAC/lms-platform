"use client";

import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { VimeoPlayer } from "@/components/student/VimeoPlayer";
import { MarkCompleteButton } from "@/components/student/MarkCompleteButton";
import { InstructorCard } from "@/components/instructor/InstructorCard";
import { ChapterSidebar } from "@/components/student/ChapterSidebar";

type Resource = {
  id: string;
  name: string;
  url: string;
  type: string;
};

type ChapterData = {
  id: string;
  title: string;
  vimeoVideoId: string | null;
  content: string | null;
  resources: Resource[];
};

type ChapterNavItem = {
  id: string;
  title: string;
};

type ModuleChapter = {
  id: string;
  title: string;
  vimeoVideoId: string | null;
  order: number;
};

type CourseModule = {
  id: string;
  title: string;
  order: number;
  chapters: ModuleChapter[];
};

type InstructorData = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  linkedin: string | null;
  website: string | null;
} | null;

type Props = {
  courseId: string;
  modules: CourseModule[];
  progressPercentage: number;
  activeChapter: ChapterData;
  completedChapterIds: string[];
  allChapters: ChapterNavItem[];
  activeIndex: number;
  instructor: InstructorData;
  enrolledBanner: boolean;
};

export function CoursePlayerClient({
  courseId,
  modules,
  progressPercentage,
  activeChapter,
  completedChapterIds,
  allChapters,
  activeIndex,
  instructor,
  enrolledBanner,
}: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const completedIds = new Set(completedChapterIds);
  const nextChapter = allChapters[activeIndex + 1] ?? null;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-[4.5rem] z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Chapter sidebar — fixed drawer on mobile, in-flow on desktop */}
      <div
        className={cn(
          "fixed top-[4.5rem] bottom-0 left-0 z-30 transition-transform duration-300",
          "md:static md:top-auto md:bottom-auto md:left-auto md:z-auto md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ChapterSidebar
          modules={modules}
          currentChapterId={activeChapter.id}
          completedIds={completedIds}
          courseId={courseId}
          progressPercentage={progressPercentage}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile: sticky toggle bar */}
        <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)] md:hidden">
          <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-1.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors min-h-10"
              aria-label="Ver temario del curso"
            >
              <BookOpen className="size-4 shrink-0" />
              <span className="truncate max-w-[210px]">{activeChapter.title}</span>
            </button>
            <span className="text-xs font-medium text-[var(--muted-foreground)] shrink-0">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="px-3 pb-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6">
          {/* Enrolled banner */}
          {enrolledBanner && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 sm:px-4 py-3 rounded-lg">
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {activeChapter.title}
              </h2>
              <div className="shrink-0 w-full sm:w-auto">
                <MarkCompleteButton
                  chapterId={activeChapter.id}
                  courseId={courseId}
                  nextChapterId={nextChapter?.id ?? null}
                  isDone={completedIds.has(activeChapter.id)}
                />
              </div>
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
                <div className="space-y-2">
                  {activeChapter.resources.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center justify-between gap-2 text-sm px-3 py-2.5 rounded-md border border-[var(--border)] hover:bg-slate-50 transition-colors text-[var(--foreground)]"
                    >
                      <span className="inline-flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">
                          {r.type === "PDF" ? "📄" : r.type === "PPTX" ? "📊" : r.type === "DOCX" ? "📝" : r.type === "XLSX" ? "📋" : "📎"}
                        </span>
                        <span className="truncate">{r.name}</span>
                      </span>
                      <span className="text-[10px] uppercase text-[var(--muted-foreground)] font-medium shrink-0">{r.type}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructor */}
          {instructor && (
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Instructor del curso
              </h3>
              <InstructorCard
                instructorId={instructor.id}
                name={instructor.name}
                title={instructor.title}
                bio={instructor.bio}
                avatarUrl={instructor.avatarUrl}
                linkedin={instructor.linkedin}
                website={instructor.website}
              />
            </div>
          )}

          {/* Chapter navigation */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[var(--border)]">
            {activeIndex > 0 ? (
              <a
                href={`/student/courses/${courseId}?chapter=${allChapters[activeIndex - 1].id}`}
                className="min-h-11 rounded-md border border-border px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-accent/40 transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="size-4 shrink-0" />
                <span className="truncate">Anterior</span>
              </a>
            ) : (
              <div className="min-h-11" />
            )}
            {nextChapter && (
              <a
                href={`/student/courses/${courseId}?chapter=${nextChapter.id}`}
                className="min-h-11 rounded-md border border-primary/30 px-3 py-2 text-sm text-[var(--primary)] hover:bg-primary/5 transition-colors flex items-center justify-end gap-2"
              >
                <span className="truncate">Siguiente</span>
                <ChevronRight className="size-4 shrink-0" />
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
