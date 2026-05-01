"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markChapterComplete } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type Props = {
  chapterId: string;
  courseId: string;
  nextChapterId: string | null;
  isDone: boolean;
};

export function MarkCompleteButton({ chapterId, courseId, nextChapterId, isDone }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await markChapterComplete(chapterId, courseId);
      if (result.success && nextChapterId) {
        router.push(`/student/courses/${courseId}?chapter=${nextChapterId}`);
      } else if (result.completed) {
        router.push(`/student/courses/${courseId}/exam`);
      }
    });
  }

  if (isDone) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
          <CheckCircle2 className="size-5" />
          Completado
        </span>
        {nextChapterId && (
          <Button size="sm" onClick={() => router.push(`/student/courses/${courseId}?chapter=${nextChapterId}`)}>
            Siguiente →
          </Button>
        )}
        {!nextChapterId && (
          <Button size="sm" variant="secondary" className="bg-green-600 text-white hover:bg-green-700" onClick={() => router.push(`/student/courses/${courseId}/exam`)}>
            Ir a evaluación →
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button onClick={handleClick} disabled={pending} size="sm">
      {pending ? "Guardando..." : "Marcar como completado"}
    </Button>
  );
}
