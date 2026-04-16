"use client";

import { useState, useActionState, useTransition } from "react";
import type { Module, Chapter } from "@prisma/client";
import {
  createChapter,
  updateChapter,
  deleteChapter,
  updateModule,
  deleteModule,
} from "@/app/actions/courses";

type ChapterWithModule = Chapter;
type ModuleWithChapters = Module & { chapters: ChapterWithModule[] };

type ActionState = { error?: string; success?: boolean } | null;

// ─── Chapter Row ────────────────────────────────────────────────────────────

function ChapterRow({
  chapter,
  courseId,
}: {
  chapter: Chapter;
  courseId: string;
}) {
  const [editing, setEditing] = useState(false);
  const updateWithIds = updateChapter.bind(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateWithIds,
    null
  );
  const [delPending, startDel] = useTransition();

  if (!editing) {
    return (
      <div className="flex items-center justify-between py-2 px-3 rounded hover:bg-slate-50 group">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--muted-foreground)] w-5 text-center">
            {chapter.order + 1}
          </span>
          <span className="text-[var(--foreground)]">{chapter.title}</span>
          {chapter.vimeoVideoId && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
              Video
            </span>
          )}
        </div>
        <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)]"
          >
            Editar
          </button>
          <button
            onClick={() => {
              if (!confirm("¿Eliminar este capítulo?")) return;
              startDel(async () => { await deleteChapter(chapter.id, courseId); });
            }}
            disabled={delPending}
            className="text-xs text-[var(--destructive)] hover:underline disabled:opacity-50"
          >
            {delPending ? "..." : "Eliminar"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="p-3 bg-slate-50 rounded border border-[var(--border)] space-y-3">
      <input type="hidden" name="id" value={chapter.id} />
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="order" value={chapter.order} />

      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Título</label>
        <input name="title" defaultValue={chapter.title} required className="input-field text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
          Vimeo Video ID
        </label>
        <input
          name="vimeoVideoId"
          defaultValue={chapter.vimeoVideoId ?? ""}
          placeholder="123456789"
          className="input-field text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
          Contenido / Descripción
        </label>
        <textarea
          name="content"
          defaultValue={chapter.content ?? ""}
          rows={2}
          className="input-field text-sm resize-none"
        />
      </div>
      {state?.error && (
        <p className="text-xs text-[var(--destructive)]">{state.error}</p>
      )}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-3 py-1.5"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="text-sm bg-[var(--primary)] text-white px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}

// ─── Add Chapter Form ────────────────────────────────────────────────────────

function AddChapterForm({
  moduleId,
  courseId,
  nextOrder,
  onClose,
}: {
  moduleId: string;
  courseId: string;
  nextOrder: number;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createChapter,
    null
  );

  return (
    <form
      action={async (fd) => {
        await formAction(fd);
        onClose();
      }}
      className="p-3 bg-blue-50 rounded border border-blue-200 space-y-3"
    >
      <input type="hidden" name="moduleId" value={moduleId} />
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="order" value={nextOrder} />

      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
          Título del capítulo <span className="text-[var(--destructive)]">*</span>
        </label>
        <input name="title" required placeholder="Ej: Introducción a la norma" className="input-field text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
          Vimeo Video ID
        </label>
        <input name="vimeoVideoId" placeholder="123456789" className="input-field text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
          Contenido / Descripción
        </label>
        <textarea name="content" rows={2} className="input-field text-sm resize-none" />
      </div>
      {state?.error && (
        <p className="text-xs text-[var(--destructive)]">{state.error}</p>
      )}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="text-sm text-[var(--muted-foreground)] px-3 py-1.5">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="text-sm bg-[var(--primary)] text-white px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Agregando..." : "Agregar capítulo"}
        </button>
      </div>
    </form>
  );
}

// ─── Module Accordion ────────────────────────────────────────────────────────

export function ModuleAccordion({
  mod,
  courseId,
}: {
  mod: ModuleWithChapters;
  courseId: string;
}) {
  const [open, setOpen] = useState(true);
  const [editingModule, setEditingModule] = useState(false);
  const [addingChapter, setAddingChapter] = useState(false);
  const [delPending, startDel] = useTransition();

  const updateModuleWithIds = updateModule.bind(null);
  const [modState, modFormAction, modPending] = useActionState<ActionState, FormData>(
    updateModuleWithIds,
    null
  );

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      {/* Module Header */}
      <div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
        {editingModule ? (
          <form action={modFormAction} className="flex items-center gap-2 flex-1">
            <input type="hidden" name="id" value={mod.id} />
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="order" value={mod.order} />
            <input
              name="title"
              defaultValue={mod.title}
              required
              className="input-field text-sm flex-1"
              autoFocus
            />
            {modState?.error && (
              <span className="text-xs text-[var(--destructive)]">{modState.error}</span>
            )}
            <button type="submit" disabled={modPending} className="text-xs bg-[var(--primary)] text-white px-2.5 py-1.5 rounded hover:opacity-90 disabled:opacity-60">
              {modPending ? "..." : "OK"}
            </button>
            <button type="button" onClick={() => setEditingModule(false)} className="text-xs text-[var(--muted-foreground)]">
              ✕
            </button>
          </form>
        ) : (
          <>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] flex-1 text-left"
            >
              <span className="text-[var(--muted-foreground)]">{open ? "▾" : "▸"}</span>
              <span className="text-xs text-[var(--muted-foreground)] font-normal">
                Módulo {mod.order + 1} ·
              </span>
              {mod.title}
              <span className="text-xs text-[var(--muted-foreground)] font-normal ml-1">
                ({mod.chapters.length} capítulos)
              </span>
            </button>
            <div className="flex gap-3 ml-2">
              <button
                onClick={() => setEditingModule(true)}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)]"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  if (!confirm("¿Eliminar este módulo y todos sus capítulos?")) return;
                  startDel(async () => { await deleteModule(mod.id, courseId); });
                }}
                disabled={delPending}
                className="text-xs text-[var(--destructive)] hover:underline disabled:opacity-50"
              >
                {delPending ? "..." : "Eliminar"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Chapters */}
      {open && (
        <div className="px-3 py-2 space-y-1 bg-white">
          {mod.chapters.length === 0 && !addingChapter && (
            <p className="text-xs text-[var(--muted-foreground)] py-2 text-center">
              Sin capítulos todavía
            </p>
          )}
          {mod.chapters.map((ch) => (
            <ChapterRow key={ch.id} chapter={ch} courseId={courseId} />
          ))}

          {addingChapter ? (
            <AddChapterForm
              moduleId={mod.id}
              courseId={courseId}
              nextOrder={mod.chapters.length}
              onClose={() => setAddingChapter(false)}
            />
          ) : (
            <button
              onClick={() => setAddingChapter(true)}
              className="w-full text-xs text-[var(--primary)] hover:underline py-1.5 text-left px-3"
            >
              + Agregar capítulo
            </button>
          )}
        </div>
      )}
    </div>
  );
}
