"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markChapterComplete } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, ChevronRight, Loader2, Trophy } from "lucide-react";

type Props = {
  chapterId: string;
  courseId: string;
  nextChapterId: string | null;
  isDone: boolean;
};

export function MarkCompleteButton({
  chapterId,
  courseId,
  nextChapterId,
  isDone,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [cursoCompletado, setCursoCompletado] = useState(false);
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await markChapterComplete(chapterId, courseId);
      if (result.error) return;

      // Al terminar el curso preguntamos antes de llevar a la evaluación
      if (result.completed) {
        setCursoCompletado(true);
        return;
      }
      if (result.success && nextChapterId) {
        router.push(`/student/courses/${courseId}?chapter=${nextChapterId}`);
      }
    });
  }

  return (
    <>
      {isDone ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="size-4" />
            Completada
          </span>
          {nextChapterId ? (
            <Button
              className="w-full sm:w-auto font-semibold"
              size="sm"
              onClick={() =>
                router.push(`/student/courses/${courseId}?chapter=${nextChapterId}`)
              }
            >
              Siguiente clase
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full sm:w-auto font-semibold"
              onClick={() => router.push(`/student/courses/${courseId}/exam`)}
            >
              Ir a evaluación
              <ChevronRight className="size-4" />
            </Button>
          )}
        </div>
      ) : (
        <Button
          onClick={handleClick}
          disabled={pending}
          size="sm"
          className="w-full sm:w-auto min-h-11 font-semibold sm:min-h-9"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Marcar como completada"
          )}
        </Button>
      )}

      {/* Curso terminado: el estudiante decide cuándo rendir la evaluación */}
      <Dialog open={cursoCompletado} onOpenChange={setCursoCompletado}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <span className="mb-2 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Trophy className="size-6" />
            </span>
            <DialogTitle className="text-lg">
              ¡Completaste todas las clases!
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              Ya puedes rendir la evaluación final del curso. Tienes 2 intentos
              y necesitas al menos 70% para aprobar. Si prefieres repasar
              primero, puedes darla más adelante desde Mis cursos.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="w-full font-semibold sm:w-auto"
              onClick={() => setCursoCompletado(false)}
            >
              La daré después
            </Button>
            <Button
              className="w-full font-semibold sm:w-auto"
              onClick={() => router.push(`/student/courses/${courseId}/exam`)}
            >
              Rendir ahora
              <ChevronRight className="size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
