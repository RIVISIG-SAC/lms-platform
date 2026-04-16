"use client";

import { useActionState } from "react";
import type { Course } from "@prisma/client";

type ActionState = { error?: string; success?: boolean } | null;
type CourseAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

type Props = {
  action: CourseAction;
  course?: Course;
};

export function CourseForm({ action, course }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-5">
      {course && <input type="hidden" name="id" value={course.id} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Título del curso <span className="text-[var(--destructive)]">*</span>
          </label>
          <input
            name="title"
            required
            defaultValue={course?.title}
            placeholder="Ej: Implementación ISO 9001:2015"
            className="input-field"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Descripción <span className="text-[var(--destructive)]">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={course?.description}
            placeholder="Describe el contenido y objetivos del curso..."
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            Precio (S/.) <span className="text-[var(--destructive)]">*</span>
          </label>
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={course ? Number(course.price) : ""}
            placeholder="0.00"
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
            URL de imagen (thumbnail)
          </label>
          <input
            name="thumbnailUrl"
            type="url"
            defaultValue={course?.thumbnailUrl ?? ""}
            placeholder="https://..."
            className="input-field"
          />
        </div>

        {course && (
          <div className="flex items-center gap-3">
            <input
              type="hidden"
              name="published"
              value={course.published ? "true" : "false"}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked={course.published}
                onChange={(e) => {
                  const hidden = e.target.form?.querySelector<HTMLInputElement>(
                    'input[name="published"]'
                  );
                  if (hidden) hidden.value = e.target.checked ? "true" : "false";
                }}
                className="w-4 h-4 rounded border-[var(--border)] accent-[var(--primary)]"
              />
              <span className="text-sm text-[var(--foreground)]">
                Publicado (visible para estudiantes)
              </span>
            </label>
          </div>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-[var(--destructive)] bg-red-50 px-3 py-2 rounded-md border border-red-200">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-md border border-green-200">
          Cambios guardados correctamente.
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-[var(--primary)] text-white text-sm font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Guardando..." : course ? "Guardar cambios" : "Crear curso"}
        </button>
      </div>
    </form>
  );
}
