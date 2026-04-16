"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markChapterComplete } from "@/app/actions/progress";

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
          <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-xs">✓</span>
          Completado
        </span>
        {nextChapterId && (
          <button
            onClick={() => router.push(`/student/courses/${courseId}?chapter=${nextChapterId}`)}
            className="bg-[var(--primary)] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Siguiente →
          </button>
        )}
        {!nextChapterId && (
          <button
            onClick={() => router.push(`/student/courses/${courseId}/exam`)}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Ir a evaluación →
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="bg-[var(--primary)] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Guardando..." : "Marcar como completado"}
    </button>
  );
}
