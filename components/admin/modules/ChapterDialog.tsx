"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import type { Chapter } from "@prisma/client";
import { Loader2, PlayCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { createChapter, updateChapter } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  AdminAlert,
  AdminField,
  AdminHint,
  DialogIcon,
} from "@/components/admin/AdminField";
import { AREA_ADMIN, CONTROL_ADMIN } from "@/components/admin/form-styles";
import { cn } from "@/lib/utils";

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

/** Acepta el ID pelado o una URL de Vimeo, y se queda con el ID numérico. */
function normalizarVimeo(valor: string) {
  const soloDigitos = valor.match(/(\d{6,})/);
  return soloDigitos ? soloDigitos[1] : valor.replace(/\D/g, "");
}

export function ChapterDialog(props: Props) {
  const { mode, courseId, trigger } = props;
  const isCreate = mode === "create";
  const action = isCreate ? createChapter : updateChapter;
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  const chapter = !isCreate ? props.chapter : null;
  const [vimeo, setVimeo] = useState(chapter?.vimeoVideoId ?? "");

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success(isCreate ? "Capítulo creado" : "Capítulo actualizado");
      setOpen(false);
    }
  }, [state, isCreate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogIcon icon={isCreate ? PlayCircle : Save} />
          <DialogTitle className="text-lg">
            {isCreate ? "Nuevo capítulo" : "Editar capítulo"}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            {isCreate
              ? `Será la clase ${props.nextOrder + 1} de este módulo. Los recursos descargables se añaden después de crearlo.`
              : "Actualiza el título, el video y la descripción de la clase."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
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

          <AdminField id="chapter-title" label="Título de la clase">
            <Input
              id="chapter-title"
              name="title"
              required
              minLength={2}
              defaultValue={chapter?.title ?? ""}
              placeholder="Ej. Introducción a la norma"
              autoFocus
              className={CONTROL_ADMIN}
            />
          </AdminField>

          <AdminField
            id="chapter-vimeo"
            label={
              <>
                Video de Vimeo{" "}
                <span className="font-normal text-muted-foreground/60">
                  (opcional)
                </span>
              </>
            }
            hint={
              <AdminHint>
                Pega el ID o la URL completa: nos quedamos con el ID
                automáticamente.
              </AdminHint>
            }
          >
            <Input
              id="chapter-vimeo"
              name="vimeoVideoId"
              inputMode="numeric"
              value={vimeo}
              onChange={(e) => setVimeo(e.target.value)}
              onBlur={(e) => setVimeo(normalizarVimeo(e.target.value))}
              placeholder="123456789"
              className={cn(CONTROL_ADMIN, "font-mono")}
            />
          </AdminField>

          <AdminField
            id="chapter-content"
            label={
              <>
                Descripción{" "}
                <span className="font-normal text-muted-foreground/60">
                  (opcional)
                </span>
              </>
            }
            hint={
              <AdminHint>
                Se muestra bajo el video, en la página de la clase.
              </AdminHint>
            }
          >
            <Textarea
              id="chapter-content"
              name="content"
              rows={4}
              defaultValue={chapter?.content ?? ""}
              placeholder="Resumen del capítulo, temas a cubrir, puntos clave..."
              className={cn(AREA_ADMIN, "min-h-24")}
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
