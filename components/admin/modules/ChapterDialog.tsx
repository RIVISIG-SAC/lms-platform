"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import type { Chapter } from "@prisma/client";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createChapter, updateChapter } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type BaseProps = {
  courseId: string;
  trigger: ReactNode;
};

type CreateProps = BaseProps & {
  mode: "create";
  moduleId: string;
  nextOrder: number;
  chapter?: never;
};

type EditProps = BaseProps & {
  mode: "edit";
  moduleId?: never;
  nextOrder?: never;
  chapter: Chapter;
};

type Props = CreateProps | EditProps;

export function ChapterDialog(props: Props) {
  const { mode, courseId, trigger } = props;
  const isCreate = mode === "create";
  const action = isCreate ? createChapter : updateChapter;
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success(isCreate ? "Capítulo creado" : "Capítulo actualizado");
      setOpen(false);
    }
  }, [state, isCreate]);

  const chapter = !isCreate ? props.chapter : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Nuevo capítulo" : "Editar capítulo"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Añade un capítulo dentro de este módulo. Podrás agregar recursos descargables después."
              : "Actualiza el contenido del capítulo. Los cambios se guardarán al confirmar."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4 py-1">
          <input type="hidden" name="courseId" value={courseId} />
          {isCreate ? (
            <>
              <input type="hidden" name="moduleId" value={props.moduleId} />
              <input type="hidden" name="order" value={props.nextOrder} />
            </>
          ) : (
            <>
              <input type="hidden" name="id" value={chapter!.id} />
              <input type="hidden" name="order" value={chapter!.order} />
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="chapter-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="chapter-title"
              name="title"
              required
              minLength={2}
              defaultValue={chapter?.title ?? ""}
              placeholder="Ej. Introducción a la norma"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chapter-vimeo" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Vimeo Video ID
            </Label>
            <Input
              id="chapter-vimeo"
              name="vimeoVideoId"
              defaultValue={chapter?.vimeoVideoId ?? ""}
              placeholder="123456789"
            />
            <p className="text-xs text-muted-foreground">
              Sólo el ID numérico del video, no la URL completa.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="chapter-content" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Descripción
            </Label>
            <Textarea
              id="chapter-content"
              name="content"
              rows={4}
              defaultValue={chapter?.content ?? ""}
              placeholder="Resumen del capítulo, temas a cubrir, puntos clave..."
              className="resize-none"
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
                  {isCreate ? "Crear capítulo" : "Guardar cambios"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
