"use client";

import { useState, useTransition } from "react";
import { submitExam } from "@/app/actions/exam";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Option = { id: string; text: string };
type Question = { id: string; text: string; order: number; options: Option[] };

type Props = {
  courseId: string;
  questions: Question[];
  attemptNumber: number;
};

type Result = { score: number; passed: boolean } | null;

export function ExamForm({ courseId, questions, attemptNumber }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allAnswered = questions.every((q) => answers[q.id]);

  function handleSubmit() {
    if (!allAnswered) {
      setError("Debes responder todas las preguntas antes de enviar.");
      return;
    }
    if (!confirm("¿Estás seguro de enviar la evaluación? No podrás modificar tus respuestas.")) return;

    setError(null);
    startTransition(async () => {
      const res = await submitExam(courseId, answers);
      if (res.error) {
        setError(res.error);
      } else if (res.score !== undefined && res.passed !== undefined) {
        setResult({ score: res.score, passed: res.passed });
      }
    });
  }

  if (result) {
    return (
      <div className={cn(
        "rounded-xl p-8 text-center space-y-4 border",
        result.passed ? "bg-green-50 border-green-200" : "bg-destructive/5 border-destructive/20"
      )}>
        <div className="text-5xl">{result.passed ? "🎓" : "📋"}</div>
        <div>
          <p className={cn("text-2xl font-bold", result.passed ? "text-green-700" : "text-destructive")}>
            {result.score.toFixed(0)}%
          </p>
          <p className={cn("text-lg font-semibold mt-1", result.passed ? "text-green-800" : "text-destructive/80")}>
            {result.passed ? "¡Evaluación Aprobada!" : "No Aprobado"}
          </p>
        </div>
        <p className={cn("text-sm", result.passed ? "text-green-700" : "text-muted-foreground")}>
          {result.passed
            ? "Tu certificado ha sido generado. Puedes descargarlo desde Mis Cursos."
            : attemptNumber >= 2
            ? "Has agotado tus intentos. Deberás reinscribirte para intentarlo nuevamente."
            : "Tienes 1 intento más disponible. Estudia el material y vuelve a intentarlo."}
        </p>
        <a
          href={result.passed ? "/student/my-courses" : `/student/courses/${courseId}`}
          className={cn(
            "inline-block text-sm font-medium px-5 py-2.5 rounded-md transition-opacity hover:opacity-90",
            result.passed ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"
          )}
        >
          {result.passed ? "Ver mi certificado" : "Volver al curso"}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground bg-muted/50 border border-border rounded-lg px-4 py-3">
        <span>Intento {attemptNumber} de 2</span>
        <span className="sm:order-last">Mínimo: 70%</span>
        <span className="w-full sm:w-auto">
          {Object.keys(answers).length} / {questions.length} respondidas
        </span>
      </div>

      <div className="space-y-5">
        {questions.map((question, qi) => (
          <div key={question.id} className="bg-card border border-border rounded-lg p-5">
            <p className="text-sm font-medium text-foreground mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mr-2">
                {qi + 1}
              </span>
              {question.text}
            </p>
            <div className="space-y-2">
              {question.options.map((opt) => {
                const selected = answers[question.id] === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={cn(
                      "relative flex items-center gap-3 px-4 py-3.5 sm:py-3 min-h-[44px] rounded-lg border cursor-pointer transition-all",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-accent/50"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                        selected ? "border-primary" : "border-border"
                      )}
                    >
                      {selected && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </span>
                    <input
                      type="radio"
                      name={question.id}
                      value={opt.id}
                      checked={selected}
                      onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: opt.id }))}
                      className="sr-only"
                    />
                    <span className="text-sm text-foreground">{opt.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-4 py-3 rounded-lg">
          {error}
        </p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={pending || !allAnswered}
        className="w-full py-6 text-base font-semibold"
      >
        {pending ? "Enviando evaluación..." : "Enviar evaluación"}
      </Button>
    </div>
  );
}
