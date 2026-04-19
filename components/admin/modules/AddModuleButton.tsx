"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createModule } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ActionState = { error?: string; success?: boolean } | null;

type Props = {
  courseId: string;
  nextOrder: number;
  variant?: "default" | "ghost";
};

export function AddModuleButton({ courseId, nextOrder, variant = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createModule, null);

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
        className="w-full h-12 border-dashed font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/30"
      >
        <Plus className="size-4" /> Añadir módulo
      </Button>
    ) : (
      <Button type="button" className="h-10 font-semibold">
        <Plus className="size-4" /> Nuevo módulo
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo módulo</DialogTitle>
          <DialogDescription>
            Los módulos agrupan los capítulos del curso. Podrás añadir capítulos tras crearlo.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 py-1">
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="order" value={nextOrder} />

          <div className="space-y-1.5">
            <Label htmlFor="module-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Título del módulo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="module-title"
              name="title"
              required
              minLength={2}
              placeholder="Ej. Fundamentos de gestión de calidad"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
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
