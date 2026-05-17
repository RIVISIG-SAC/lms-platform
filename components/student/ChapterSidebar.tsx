"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, PlayCircle, Circle } from "lucide-react";

type Chapter = {
  id: string;
  title: string;
  vimeoVideoId: string | null;
  order: number;
};

type Module = {
  id: string;
  title: string;
  order: number;
  chapters: Chapter[];
};

type Props = {
  modules: Module[];
  currentChapterId: string;
  completedIds: Set<string>;
  courseId: string;
  progressPercentage: number;
  onClose?: () => void;
};

export function ChapterSidebar({
  modules,
  currentChapterId,
  completedIds,
  courseId,
  progressPercentage,
  onClose,
}: Props) {
  return (
    <aside className="w-[88vw] max-w-sm md:w-72 shrink-0 border-r border-border bg-card flex flex-col h-full overflow-hidden">
      {/* Progress header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center justify-between flex-1 text-xs text-muted-foreground">
            <span>Progreso del curso</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          {/* Close button — mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden ml-3 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar temario"
            >
              ✕
            </button>
          )}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Chapter list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {modules.map((mod) => (
          <div key={mod.id}>
            <p className="px-4 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {mod.order + 1}. {mod.title}
            </p>
            {mod.chapters.map((ch) => {
              const isActive = ch.id === currentChapterId;
              const isDone = completedIds.has(ch.id);

              return (
                <Link
                  key={ch.id}
                  href={`/student/courses/${courseId}?chapter=${ch.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm transition-colors min-h-11",
                    isActive
                      ? "bg-primary/5 text-primary font-medium border-r-2 border-primary"
                      : "text-foreground hover:bg-accent/50"
                  )}
                >
                  {/* Status icon */}
                  {isDone ? (
                    <CheckCircle2 className="shrink-0 size-5 text-green-600" />
                  ) : isActive ? (
                    <PlayCircle className="shrink-0 size-5 text-primary" />
                  ) : (
                    <Circle className="shrink-0 size-5 text-border" />
                  )}
                  <span className="flex-1 leading-snug line-clamp-2">{ch.title}</span>
                  {ch.vimeoVideoId && !isActive && !isDone && (
                    <span className="shrink-0 text-[10px] text-muted-foreground font-medium">▶</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
