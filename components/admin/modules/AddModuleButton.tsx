"use client";

import { useActionState, useEffect, useState } from "react";
import { Layers, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createModule } from "@/app/actions/courses";
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
  AdminHint,
  DialogIcon,
} from "@/components/admin/AdminField";
import { CONTROL_ADMIN } from "@/components/admin/form-styles";

type ActionState = { error?: string; success?: boolean } | null;

type Props = {
  courseId: string;
  nextOrder: number;
  variant?: "default" | "ghost";
};

export function AddModuleButton({ courseId, nextOrder, variant = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createModule,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success("Módulo creado");
      setOpen(false);
    }
  }, [state]);

  const trigger =
    variant === "ghost" ? (
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full border-dashed font-semibold text-muted-foreground hover:border-primary/40 hover:bg-accent/30 hover:text-foreground"
      >
        <Plus className="size-4" /> Añadir módulo
      </Button>
    ) : (
      <Button type="button" className="min-h-10 gap-2 font-semibold">
        <Plus className="size-4" /> Nuevo módulo
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogIcon icon={Layers} />
          <DialogTitle className="text-lg">Nuevo módulo</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Los módulos agrupan los capítulos del curso. Este será el módulo{" "}
            {nextOrder + 1}.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="order" value={nextOrder} />

          <AdminField
            id="module-title"
            label="Título del módulo"
            hint={
              <AdminHint>
                Nombra el bloque temático, no el curso. Mínimo 2 caracteres.
              </AdminHint>
            }
          >
            <Input
              id="module-title"
              name="title"
              required
              minLength={2}
              placeholder="Ej. Fundamentos de gestión de calidad"
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
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Crear módulo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
