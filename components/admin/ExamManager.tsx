"use client";

import { useState, useActionState, useTransition } from "react";
import { createQuestion, deleteQuestion } from "@/app/actions/exam";

type Option = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; order: number; options: Option[] };
type ActionState = { error?: string; success?: boolean } | null;

// ─── Add Question Form ───────────────────────────────────────────────────────

function AddQuestionForm({ courseId, nextOrder, onClose }: { courseId: string; nextOrder: number; onClose: () => void }) {
  const [options, setOptions] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createQuestion, null);

  function setCorrect(idx: number) {
    setOptions(options.map((o, i) => ({ ...o, isCorrect: i === idx })));
  }

  return (
    <form
      action={async (fd) => {
        // Agregar opciones al FormData
        options.forEach((opt, i) => {
          fd.append(`options[${i}][text]`, opt.text);
          fd.append(`options[${i}][isCorrect]`, String(opt.isCorrect));
        });
        await formAction(fd);
        onClose();
      }}
      className="border border-[var(--primary)] rounded-lg p-5 bg-blue-50 space-y-4"
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="order" value={nextOrder} />

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
          Pregunta <span className="text-[var(--destructive)]">*</span>
        </label>
        <textarea
          name="text"
          required
          rows={2}
          autoFocus
          placeholder="Escribe la pregunta..."
          className="input-field resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Opciones — selecciona la correcta
        </label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrect(i)}
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  opt.isCorrect
                    ? "border-green-500 bg-green-500"
                    : "border-slate-300 hover:border-slate-400"
                }`}
              >
                {opt.isCorrect && <span className="text-white text-xs">✓</span>}
              </button>
              <input
                value={opt.text}
                onChange={(e) =>
                  setOptions(options.map((o, j) => (j === i ? { ...o, text: e.target.value } : o)))
                }
                placeholder={`Opción ${i + 1}`}
                className="input-field text-sm flex-1"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => options.length < 6 && setOptions([...options, { text: "", isCorrect: false }])}
          className="text-xs text-[var(--primary)] hover:underline mt-2"
        >
          + Agregar opción
        </button>
      </div>

      {state?.error && <p className="text-sm text-[var(--destructive)]">{state.error}</p>}

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onClose} className="text-sm text-[var(--muted-foreground)] px-3 py-2">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="text-sm bg-[var(--primary)] text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar pregunta"}
        </button>
      </div>
    </form>
  );
}

// ─── Question Card ───────────────────────────────────────────────────────────

function QuestionCard({ question, courseId }: { question: Question; courseId: string }) {
  const [delPending, startDel] = useTransition();
  const correct = question.options.find((o) => o.isCorrect);

  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-medium text-[var(--foreground)] flex-1">
          <span className="text-[var(--muted-foreground)] font-normal mr-1">{question.order + 1}.</span>
          {question.text}
        </p>
        <button
          onClick={() => {
            if (!confirm("¿Eliminar esta pregunta?")) return;
            startDel(async () => { await deleteQuestion(question.id, courseId); });
          }}
          disabled={delPending}
          className="text-xs text-[var(--destructive)] hover:underline flex-shrink-0 disabled:opacity-50"
        >
          {delPending ? "..." : "Eliminar"}
        </button>
      </div>
      <ul className="space-y-1">
        {question.options.map((opt) => (
          <li key={opt.id} className={`flex items-center gap-2 text-sm ${opt.isCorrect ? "text-green-700 font-medium" : "text-[var(--muted-foreground)]"}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${opt.isCorrect ? "bg-green-100" : "bg-slate-100"}`}>
              {opt.isCorrect ? "✓" : "○"}
            </span>
            {opt.text}
          </li>
        ))}
      </ul>
      {correct && (
        <p className="text-xs text-[var(--muted-foreground)] mt-2 pt-2 border-t border-[var(--border)]">
          Respuesta correcta: <span className="text-green-700 font-medium">{correct.text}</span>
        </p>
      )}
    </div>
  );
}

// ─── Exam Manager ────────────────────────────────────────────────────────────

export function ExamManager({ courseId, questions }: { courseId: string; questions: Question[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-[var(--foreground)]">
          Evaluación Final
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted-foreground)]">
            {questions.length} preguntas · Puntaje mínimo: 70%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {questions.length === 0 && !adding && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            Este curso no tiene preguntas de evaluación todavía.
          </div>
        )}

        {questions.map((q) => (
          <QuestionCard key={q.id} question={q} courseId={courseId} />
        ))}

        {adding ? (
          <AddQuestionForm
            courseId={courseId}
            nextOrder={questions.length}
            onClose={() => setAdding(false)}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full border-2 border-dashed border-[var(--border)] rounded-lg py-4 text-sm text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          >
            + Agregar pregunta
          </button>
        )}
      </div>
    </section>
  );
}
