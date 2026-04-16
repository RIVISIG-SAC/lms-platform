"use client";

import { useState, useActionState } from "react";
import { createModule } from "@/app/actions/courses";

type ActionState = { error?: string; success?: boolean } | null;

export function AddModuleForm({
  courseId,
  nextOrder,
}: {
  courseId: string;
  nextOrder: number;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createModule,
    null
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-[var(--border)] rounded-lg py-4 text-sm text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
      >
        + Agregar módulo
      </button>
    );
  }

  return (
    <form
      action={async (fd) => {
        await formAction(fd);
        setOpen(false);
      }}
      className="border border-[var(--primary)] rounded-lg p-4 space-y-3 bg-blue-50"
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="order" value={nextOrder} />

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Nombre del módulo <span className="text-[var(--destructive)]">*</span>
        </label>
        <input
          name="title"
          required
          autoFocus
          placeholder="Ej: Fundamentos del sistema"
          className="input-field"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-[var(--destructive)]">{state.error}</p>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-3 py-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="text-sm bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Creando..." : "Crear módulo"}
        </button>
      </div>
    </form>
  );
}
