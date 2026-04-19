"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import type { Module } from "@prisma/client";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateModule } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ActionState = { error?: string; success?: boolean } | null;

type Props = {
  mod: Module;
  courseId: string;
  trigger: ReactNode;
};

export function ModuleEditDialog({ mod, courseId, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateModule, null);

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
          <DialogTitle>Editar módulo</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4 py-1">
          <input type="hidden" name="id" value={mod.id} />
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="order" value={mod.order} />

          <div className="space-y-1.5">
            <Label htmlFor="module-edit-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="module-edit-title"
              name="title"
              required
              minLength={2}
              defaultValue={mod.title}
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
