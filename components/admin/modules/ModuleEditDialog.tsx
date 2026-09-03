"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import type { Module } from "@prisma/client";
import { Loader2, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import { updateModule } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AdminAlert,
  AdminField,
  DialogIcon,
} from "@/components/admin/AdminField";
import { CONTROL_ADMIN } from "@/components/admin/form-styles";

type ActionState = { error?: string; success?: boolean } | null;

type Props = {
  mod: Module;
  courseId: string;
  trigger: ReactNode;
};

export function ModuleEditDialog({ mod, courseId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateModule,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success("Módulo actualizado");
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogIcon icon={Pencil} />
          <DialogTitle className="text-lg">Editar módulo</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Cambia el nombre del módulo {mod.order + 1}. Los capítulos que
            contiene no se ven afectados.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={mod.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="order" value={mod.order} />

          <AdminField id="module-edit-title" label="Título del módulo">
            <Input
              id="module-edit-title"
              name="title"
              required
              minLength={2}
              defaultValue={mod.title}
              autoFocus
              className={CONTROL_ADMIN}
            />
          </AdminField>

          {state?.error && <AdminAlert>{state.error}</AdminAlert>}

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="w-full font-semibold sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="w-full gap-2 font-semibold sm:w-auto"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
