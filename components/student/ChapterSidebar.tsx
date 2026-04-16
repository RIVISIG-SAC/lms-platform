"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

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
};

export function ChapterSidebar({
  modules,
  currentChapterId,
  completedIds,
  courseId,
  progressPercentage,
}: Props) {
  return (
    <aside className="w-72 flex-shrink-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col h-full overflow-hidden">
      {/* Progress header */}
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <div className="flex justify-between text-xs text-[var(--muted-foreground)] mb-1.5">
          <span>Progreso del curso</span>
          <span className="font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Chapter list */}
      <nav className="flex-1 overflow-y-auto py-2">
        {modules.map((mod) => (
          <div key={mod.id}>
            <p className="px-4 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
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
                    "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-blue-50 text-[var(--primary)] font-medium border-r-2 border-[var(--primary)]"
                      : "text-[var(--foreground)] hover:bg-slate-50"
                  )}
                >
                  {/* Status icon */}
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs">
                    {isDone ? (
                      <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">
                        ✓
                      </span>
                    ) : isActive ? (
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-[var(--primary)] flex items-center justify-center text-xs">
                        ▶
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-slate-200 bg-white" />
                    )}
                  </span>
                  <span className="flex-1 leading-snug line-clamp-2">{ch.title}</span>
                  {ch.vimeoVideoId && (
                    <span className="flex-shrink-0 text-xs text-[var(--muted-foreground)]">
                      ▶
                    </span>
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
