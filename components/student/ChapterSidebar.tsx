"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCircle2, PlayCircle, Circle, X } from "lucide-react";

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
  // Numeración global de clases (1..N) a lo largo de todos los módulos
  const numeroDeClase = new Map<string, number>();
  let contador = 0;
  let completadas = 0;

  for (const mod of modules) {
    for (const ch of mod.chapters) {
      numeroDeClase.set(ch.id, ++contador);
      if (completedIds.has(ch.id)) completadas++;
    }
  }

  const total = contador;
  const progreso = Math.round(progressPercentage);

  return (
    <aside className="w-[88vw] max-w-sm md:w-80 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden">
      {/* Progreso del curso */}
      <div className="shrink-0 border-b border-border px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Temario
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden -mr-1 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Cerrar temario"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">
            {completadas} de {total} {total === 1 ? "clase" : "clases"}
          </span>
          <span className="text-sm font-black tabular-nums text-primary">
            {progreso}%
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </div>

      {/* Lista de capítulos */}
      <nav className="flex-1 overflow-y-auto">
        {modules.map((mod) => (
          <div key={mod.id} className="border-b border-border/60 last:border-b-0">
            <div className="sticky top-0 z-10 border-b border-border/60 bg-card/95 px-4 py-2.5 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase leading-snug tracking-wide text-foreground/70">
                {mod.title}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {mod.chapters.length}{" "}
                {mod.chapters.length === 1 ? "clase" : "clases"}
              </p>
            </div>

            {mod.chapters.map((ch) => {
              const isActive = ch.id === currentChapterId;
              const isDone = completedIds.has(ch.id);

              return (
                <Link
                  key={ch.id}
                  href={`/student/courses/${courseId}?chapter=${ch.id}`}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-start gap-3 py-3 pl-4 pr-3 transition-colors min-h-11",
                    isActive ? "bg-primary/5" : "hover:bg-accent/50",
                  )}
                >
                  {isActive && (
                    <span
                      className="absolute inset-y-0 right-0 w-0.5 bg-primary"
                      aria-hidden="true"
                    />
                  )}

                  {isDone ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  ) : isActive ? (
                    <PlayCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                  ) : (
                    <Circle className="mt-0.5 size-5 shrink-0 text-border" />
                  )}

                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm leading-snug line-clamp-2",
                        isActive
                          ? "font-semibold text-primary"
                          : "text-foreground",
                      )}
                    >
                      {ch.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground">
                      Clase {numeroDeClase.get(ch.id)}
                      {isDone && " · Completada"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
