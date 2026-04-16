"use client";

import { useState, useTransition } from "react";
import { submitExam } from "@/app/actions/exam";

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
      <div className={`rounded-xl p-8 text-center space-y-4 border ${result.passed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <div className="text-5xl">{result.passed ? "🎓" : "📋"}</div>
        <div>
          <p className="text-2xl font-bold" style={{ color: result.passed ? "#166534" : "#991b1b" }}>
            {result.score.toFixed(0)}%
          </p>
          <p className={`text-lg font-semibold mt-1 ${result.passed ? "text-green-800" : "text-red-800"}`}>
            {result.passed ? "¡Evaluación Aprobada!" : "No Aprobado"}
          </p>
        </div>
        <p className={`text-sm ${result.passed ? "text-green-700" : "text-red-700"}`}>
          {result.passed
            ? "Tu certificado ha sido generado. Puedes descargarlo desde Mis Cursos."
            : attemptNumber >= 2
            ? "Has agotado tus intentos. Deberás reinscribirte para intentarlo nuevamente."
            : "Tienes 1 intento más disponible. Estudia el material y vuelve a intentarlo."}
        </p>
        <a
          href={result.passed ? "/student/my-courses" : `/student/courses/${courseId}`}
          className={`inline-block text-sm font-medium px-5 py-2.5 rounded-md ${result.passed ? "bg-green-600 text-white hover:opacity-90" : "bg-[var(--primary)] text-white hover:opacity-90"}`}
        >
          {result.passed ? "Ver mi certificado" : "Volver al curso"}
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)] bg-slate-50 border border-[var(--border)] rounded-lg px-4 py-3">
        <span>Intento {attemptNumber} de 2</span>
        <span>
          {Object.keys(answers).length} / {questions.length} respondidas
        </span>
        <span>Mínimo para aprobar: 70%</span>
      </div>

      <div className="space-y-5">
        {questions.map((question, qi) => (
          <div key={question.id} className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-5">
            <p className="text-sm font-medium text-[var(--foreground)] mb-4">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs font-bold mr-2">
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                      selected
                        ? "border-[var(--primary)] bg-blue-50"
                        : "border-[var(--border)] hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        selected ? "border-[var(--primary)]" : "border-slate-300"
                      }`}
                    >
                      {selected && (
                        <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                      )}
                    </span>
                    <input
                      type="radio"
                      name={question.id}
                      value={opt.id}
                      checked={selected}
                      onChange={() => setAnswers({ ...answers, [question.id]: opt.id })}
                      className="sr-only"
                    />
                    <span className="text-sm text-[var(--foreground)]">{opt.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-[var(--destructive)] bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={pending || !allAnswered}
        className="w-full bg-[var(--primary)] text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? "Enviando evaluación..." : "Enviar evaluación"}
      </button>
    </div>
  );
}
