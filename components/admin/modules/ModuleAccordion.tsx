"use client";

import { useState } from "react";
import type { Module, Chapter, ChapterResource } from "@prisma/client";
import {
  ChevronDown,
  Pencil,
  Plus,
  PlayCircle,
  FileText,
  FileSpreadsheet,
  Presentation,
  Paperclip,
  ExternalLink,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteModule, deleteChapter, deleteResource } from "@/app/actions/courses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChapterDialog } from "./ChapterDialog";
import { ResourceDialog } from "./ResourceDialog";
import { ModuleEditDialog } from "./ModuleEditDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

type ChapterWithResources = Chapter & { resources: ChapterResource[] };
type ModuleWithChapters = Module & { chapters: ChapterWithResources[] };

const RESOURCE_ICON: Record<string, typeof FileText> = {
  PDF: FileText,
  DOCX: FileText,
  PPTX: Presentation,
  XLSX: FileSpreadsheet,
  OTRO: Paperclip,
};

function ResourceRow({ resource, courseId }: { resource: ChapterResource; courseId: string }) {
  const Icon = RESOURCE_ICON[resource.type] ?? Paperclip;
  return (
    <div className="group/res flex items-center justify-between gap-2 rounded-md border border-border/50 bg-card px-3 py-1.5 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium text-foreground">{resource.name}</span>
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-semibold uppercase">
          {resource.type}
        </Badge>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover/res:opacity-100 md:opacity-0 md:group-hover/res:opacity-100 transition-opacity">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-primary p-1"
          aria-label="Abrir recurso"
        >
          <ExternalLink className="size-3.5" />
        </a>
        <DeleteConfirmDialog
          action={() => deleteResource(resource.id, courseId)}
          title="¿Eliminar recurso?"
          description={`"${resource.name}" será removido del capítulo.`}
          triggerLabel="Eliminar recurso"
          successMessage="Recurso eliminado"
          variant="icon"
          triggerClassName="size-6 text-destructive hover:bg-destructive/10"
        />
      </div>
    </div>
  );
}

function ChapterRow({
  chapter,
  courseId,
}: {
  chapter: ChapterWithResources;
  courseId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasResources = chapter.resources.length > 0;

  return (
    <div className="rounded-lg border border-border/50 bg-card">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left"
        >
          <span className="size-6 rounded-md bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center shrink-0">
            {chapter.order + 1}
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {chapter.title}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {chapter.vimeoVideoId && (
              <Badge variant="outline" className="gap-1 text-[10px] font-semibold">
                <PlayCircle className="size-3" /> Video
              </Badge>
            )}
            {hasResources && (
              <Badge variant="secondary" className="text-[10px] font-semibold">
                {chapter.resources.length} recurso{chapter.resources.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <ChapterDialog
            mode="edit"
            courseId={courseId}
            chapter={chapter}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Editar capítulo"
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <DeleteConfirmDialog
            action={() => deleteChapter(chapter.id, courseId)}
            title="¿Eliminar capítulo?"
            description={`Se eliminará "${chapter.title}" y todos sus recursos descargables.`}
            triggerLabel="Eliminar capítulo"
            successMessage="Capítulo eliminado"
            variant="icon"
          />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/50 px-3 py-3 space-y-2 bg-accent/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recursos descargables
            </span>
            <ResourceDialog
              chapterId={chapter.id}
              courseId={courseId}
              trigger={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Plus className="size-3.5" /> Añadir
                </Button>
              }
            />
          </div>

          {chapter.resources.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              Este capítulo aún no tiene recursos descargables.
            </p>
          ) : (
            <div className="space-y-1.5">
              {chapter.resources.map((r) => (
                <ResourceRow key={r.id} resource={r} courseId={courseId} />
              ))}
            </div>
          )}

          {chapter.content && (
            <div className="pt-2 border-t border-border/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Descripción
              </p>
              <p className="text-xs text-foreground/80 whitespace-pre-wrap">
                {chapter.content}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ModuleAccordion({
  mod,
  courseId,
}: {
  mod: ModuleWithChapters;
  courseId: string;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Module header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-accent/30 border-b border-border/60">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left"
        >
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform shrink-0",
              !open && "-rotate-90"
            )}
          />
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Layers className="size-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Módulo {mod.order + 1}
            </p>
            <p className="text-sm font-semibold text-foreground truncate">{mod.title}</p>
          </div>
          <Badge variant="outline" className="ml-2 text-[10px] font-semibold">
            {mod.chapters.length} cap.
          </Badge>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <ModuleEditDialog
            mod={mod}
            courseId={courseId}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Editar módulo"
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <DeleteConfirmDialog
            action={() => deleteModule(mod.id, courseId)}
            title="¿Eliminar módulo?"
            description={`Se eliminará "${mod.title}" junto con todos sus capítulos y recursos.`}
            triggerLabel="Eliminar módulo"
            successMessage="Módulo eliminado"
            variant="icon"
          />
        </div>
      </div>

      {/* Chapters */}
      {open && (
        <div className="p-3 space-y-2">
          {mod.chapters.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground italic">
              Sin capítulos todavía.
            </div>
          ) : (
            mod.chapters.map((ch) => (
              <ChapterRow key={ch.id} chapter={ch} courseId={courseId} />
            ))
          )}

          <ChapterDialog
            mode="create"
            courseId={courseId}
            moduleId={mod.id}
            nextOrder={mod.chapters.length}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-9 border-dashed font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40"
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
