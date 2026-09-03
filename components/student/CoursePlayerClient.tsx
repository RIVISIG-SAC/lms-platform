"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Paperclip,
  Presentation,
  Video,
} from "lucide-react";
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

const RESOURCE_ICONS: Record<string, typeof FileText> = {
  PDF: FileText,
  PPTX: Presentation,
  DOCX: FileText,
  XLSX: FileSpreadsheet,
  VIDEO: Video,
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
  const prevChapter = activeIndex > 0 ? allChapters[activeIndex - 1] : null;
  const nextChapter = allChapters[activeIndex + 1] ?? null;
  const hasResources = activeChapter.resources.length > 0;

  return (
    <>
      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-[7.5rem] z-20 bg-foreground/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Contenido */}
      <main className="flex-1 overflow-y-auto bg-muted/20">
        {/* Barra móvil: abre el temario y muestra el progreso */}
        <div className="sticky top-0 z-10 border-b border-border bg-card md:hidden">
          <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-1.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex min-h-10 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Ver temario del curso"
            >
              <BookOpen className="size-4 shrink-0" />
              <span className="max-w-[210px] truncate">
                {activeChapter.title}
              </span>
            </button>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="px-3 pb-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl space-y-6 px-3 py-4 sm:px-6 sm:py-8">
          {/* Banner de inscripción */}
          {enrolledBanner && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <p>
                ¡Inscripción exitosa! Ahora tienes acceso completo a este curso
                por 180 días.
              </p>
            </div>
          )}

          {/* Video */}
          {activeChapter.vimeoVideoId ? (
            <VimeoPlayer
              videoId={activeChapter.vimeoVideoId}
              title={activeChapter.title}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-card">
              <div className="text-center">
                <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-6" />
                </span>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Esta clase no tiene video
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Revisa el contenido y los recursos más abajo.
                </p>
              </div>
            </div>
          )}

          {/* Cabecera de la clase */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                Clase {activeIndex + 1} de {allChapters.length}
                {completedIds.has(activeChapter.id) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 className="size-3" />
                    Completada
                  </span>
                )}
              </p>
              <h2 className="mt-2 text-xl sm:text-2xl font-bold leading-snug text-foreground">
                {activeChapter.title}
              </h2>
            </div>
            <div className="w-full shrink-0 lg:w-auto">
              <MarkCompleteButton
                chapterId={activeChapter.id}
                courseId={courseId}
                nextChapterId={nextChapter?.id ?? null}
                isDone={completedIds.has(activeChapter.id)}
              />
            </div>
          </div>

          {/* Detalle: descripción + instructor | recursos */}
          <div
            className={cn(
              "grid grid-cols-1 gap-6",
              hasResources && "lg:grid-cols-[1.6fr_1fr] lg:gap-8",
            )}
          >
            <div className="space-y-6">
              {activeChapter.content && (
                <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <h3 className="text-sm font-bold text-foreground">
                    Sobre esta clase
                  </h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {activeChapter.content}
                  </p>
                </section>
              )}

              {instructor && (
                <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <h3 className="mb-4 text-sm font-bold text-foreground">
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
                </section>
              )}
            </div>

            {hasResources && (
              <aside className="lg:sticky lg:top-6 lg:self-start">
                <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Download className="size-4 text-primary" />
                    Recursos descargables
                  </h3>
                  <div className="mt-4 space-y-2">
                    {activeChapter.resources.map((r) => {
                      const Icon = RESOURCE_ICONS[r.type] ?? Paperclip;
                      return (
                        <a
                          key={r.id}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="group flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {r.name}
                            </span>
                            <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {r.type}
                            </span>
                          </span>
                          <Download className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                        </a>
                      );
                    })}
                  </div>
                </section>
              </aside>
            )}
          </div>

          {/* Navegación entre clases */}
          {(prevChapter || nextChapter) && (
            <div className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
              {prevChapter ? (
                <a
                  href={`/student/courses/${courseId}?chapter=${prevChapter.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <ChevronLeft className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  <span className="min-w-0 text-left">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Anterior
                    </span>
                    <span className="block truncate text-sm font-medium text-foreground">
                      {prevChapter.title}
                    </span>
                  </span>
                </a>
              ) : (
                <div className="hidden sm:block" />
              )}

              {nextChapter && (
                <a
                  href={`/student/courses/${courseId}?chapter=${nextChapter.id}`}
                  className="group flex items-center justify-end gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <span className="min-w-0 text-right">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Siguiente
                    </span>
                    <span className="block truncate text-sm font-medium text-foreground">
                      {nextChapter.title}
                    </span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                </a>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Temario — drawer en móvil, columna fija a la derecha en desktop */}
      <div
        className={cn(
          "fixed top-[7.5rem] bottom-0 right-0 z-30 transition-transform duration-300",
          "md:static md:top-auto md:bottom-auto md:right-auto md:z-auto md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
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
    </>
  );
}
