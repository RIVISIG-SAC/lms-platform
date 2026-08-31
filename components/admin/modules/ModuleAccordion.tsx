"use client";

import { useState } from "react";
import type { Module, Chapter, ChapterResource } from "@prisma/client";
import {
  ChevronDown,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Paperclip,
  Pencil,
  PlayCircle,
  Plus,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  deleteModule,
  deleteChapter,
  deleteResource,
} from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { ChapterDialog } from "./ChapterDialog";
import { ResourceDialog } from "./ResourceDialog";
import { ModuleEditDialog } from "./ModuleEditDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

type ChapterWithResources = Chapter & { resources: ChapterResource[] };
type ModuleWithChapters = Module & { chapters: ChapterWithResources[] };

const RESOURCE_ICON: Record<string, LucideIcon> = {
  PDF: FileText,
  DOCX: FileText,
  PPTX: Presentation,
  XLSX: FileSpreadsheet,
  OTRO: Paperclip,
};

function ResourceRow({
  resource,
  courseId,
}: {
  resource: ChapterResource;
  courseId: string;
}) {
  const Icon = RESOURCE_ICON[resource.type] ?? Paperclip;

  return (
    <div className="group/res flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2">
      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">
          {resource.name}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {resource.type}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 transition-opacity md:opacity-0 md:group-hover/res:opacity-100">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={`Abrir ${resource.name}`}
        >
          <ExternalLink className="size-3.5" />
        </a>
        <DeleteConfirmDialog
          action={() => deleteResource(resource.id, courseId)}
          title="¿Eliminar recurso?"
          description={`"${resource.name}" dejará de estar disponible para los estudiantes.`}
          triggerLabel="Eliminar recurso"
          successMessage="Recurso eliminado"
          variant="icon"
          triggerClassName="size-7 text-destructive hover:bg-destructive/10"
        />
      </div>
    </div>
  );
}

function ChapterRow({
  chapter,
  numero,
  courseId,
}: {
  chapter: ChapterWithResources;
  numero: number;
  courseId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const recursos = chapter.resources.length;
  const sinVideo = !chapter.vimeoVideoId;

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        expanded ? "border-primary/30 bg-card" : "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform",
              !expanded && "-rotate-90",
            )}
          />
          <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-bold tabular-nums text-muted-foreground">
            {numero}
          </span>
          <span className="truncate text-sm font-semibold text-foreground">
            {chapter.title}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "hidden items-center gap-1 text-[11px] font-semibold sm:inline-flex",
              sinVideo ? "text-amber-700" : "text-muted-foreground",
            )}
            title={sinVideo ? "Esta clase no tiene video" : "Video configurado"}
          >
            <PlayCircle className="size-3.5" />
            {sinVideo ? "Sin video" : "Video"}
          </span>
          {recursos > 0 && (
            <span className="hidden items-center gap-1 text-[11px] font-semibold text-muted-foreground sm:inline-flex">
              <Paperclip className="size-3.5" />
              {recursos}
            </span>
          )}

          <ChapterDialog
            mode="edit"
            courseId={courseId}
            chapter={chapter}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Editar ${chapter.title}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <DeleteConfirmDialog
            action={() => deleteChapter(chapter.id, courseId)}
            title="¿Eliminar capítulo?"
            description={`Se eliminará "${chapter.title}" y sus ${recursos} recurso${recursos === 1 ? "" : "s"} descargable${recursos === 1 ? "" : "s"}.`}
            triggerLabel="Eliminar capítulo"
            successMessage="Capítulo eliminado"
            variant="icon"
          />
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-border px-3 py-3.5">
          {chapter.content && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Descripción
              </p>
              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">
                {chapter.content}
              </p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Recursos descargables
              </p>
              <ResourceDialog
                chapterId={chapter.id}
                courseId={courseId}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="font-semibold text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <Plus className="size-3.5" /> Añadir
                  </Button>
                }
              />
            </div>

            {recursos === 0 ? (
              <p className="mt-2 rounded-lg border border-dashed border-border px-3 py-3 text-center text-xs text-muted-foreground">
                Sin recursos. Añade plantillas, guías o material de apoyo.
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {chapter.resources.map((r) => (
                  <ResourceRow key={r.id} resource={r} courseId={courseId} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ModuleAccordion({
  mod,
  courseId,
  /** Número de clase con el que arranca este módulo, contando todo el curso. */
  claseInicial = 1,
}: {
  mod: ModuleWithChapters;
  courseId: string;
  claseInicial?: number;
}) {
  const [open, setOpen] = useState(true);
  const total = mod.chapters.length;
  const sinVideo = mod.chapters.filter((c) => !c.vimeoVideoId).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Cabecera del módulo */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              !open && "-rotate-90",
            )}
          />
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black tabular-nums text-primary">
            {mod.order + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">
              {mod.title}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {total === 0
                ? "Sin capítulos"
                : `${total} ${total === 1 ? "capítulo" : "capítulos"}`}
              {sinVideo > 0 && (
                <span className="font-semibold text-amber-700">
                  {" "}
                  · {sinVideo} sin video
                </span>
              )}
            </p>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          <ModuleEditDialog
            mod={mod}
            courseId={courseId}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Editar ${mod.title}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <DeleteConfirmDialog
            action={() => deleteModule(mod.id, courseId)}
            title="¿Eliminar módulo?"
            description={`Se eliminará "${mod.title}" junto con sus ${total} capítulo${total === 1 ? "" : "s"} y todos sus recursos.`}
            triggerLabel="Eliminar módulo"
            successMessage="Módulo eliminado"
            variant="icon"
          />
        </div>
      </div>

      {/* Capítulos */}
      {open && (
        <div className="space-y-2 p-3">
          {total === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
              Este módulo todavía no tiene capítulos.
            </p>
          ) : (
            mod.chapters.map((ch, i) => (
              <ChapterRow
                key={ch.id}
                chapter={ch}
                numero={claseInicial + i}
                courseId={courseId}
              />
            ))
          )}

          <ChapterDialog
            mode="create"
            courseId={courseId}
            moduleId={mod.id}
            nextOrder={total}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 w-full border-dashed font-semibold text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                <Plus className="size-3.5" /> Añadir capítulo
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
