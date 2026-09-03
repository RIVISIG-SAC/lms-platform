"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { setCoursePublished } from "@/app/actions/courses";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  courseId: string;
  published: boolean;
  /** Falta contenido mínimo: se avisa antes de publicar. */
  incompleto: boolean;
};

/**
 * Control de publicación en la cabecera del editor. Es la acción que más se
 * busca, así que vive arriba y no dentro de la pestaña de Información.
 */
export function CoursePublishToggle({
  courseId,
  published,
  incompleto,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [confirmando, setConfirmando] = useState(false);

  function aplicar(siguiente: boolean) {
    setConfirmando(false);
    startTransition(async () => {
      const res = await setCoursePublished(courseId, siguiente);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(
        siguiente
          ? "Curso publicado. Ya aparece en el catálogo."
          : "Curso guardado como borrador.",
      );
    });
  }

  function onClick() {
    // Publicar un curso incompleto se confirma; despublicar es reversible
    if (!published && incompleto) {
      setConfirmando(true);
      return;
    }
    aplicar(!published);
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5">
        <span
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-lg",
            published
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700",
          )}
        >
          {published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">
            {published ? "Publicado" : "Borrador"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {published ? "Visible en el catálogo" : "Solo visible para ti"}
          </p>
        </div>
        <Button
          type="button"
          variant={published ? "outline" : "default"}
          size="sm"
          onClick={onClick}
          disabled={pending}
          className="ml-2 shrink-0 gap-1.5 font-semibold"
        >
          {pending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Guardando
            </>
          ) : published ? (
            <>
              <EyeOff className="size-3.5" />
              Pasar a borrador
            </>
          ) : (
            <>
              <Eye className="size-3.5" />
              Publicar
            </>
          )}
        </Button>
      </div>

      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <span className="mb-2 inline-flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertCircle className="size-6" />
            </span>
            <DialogTitle className="text-lg">
              ¿Publicar un curso incompleto?
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              A este curso le faltan capítulos o preguntas de evaluación. Los
              estudiantes podrán inscribirse, pero no podrán completarlo ni
              obtener su certificado.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmando(false)}
              className="w-full font-semibold sm:w-auto"
            >
              Seguir editando
            </Button>
            <Button
              type="button"
              onClick={() => aplicar(true)}
              className="w-full font-semibold sm:w-auto"
            >
              Publicar de todos modos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
