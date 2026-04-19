"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Circle, GraduationCap, Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { createQuestion, deleteQuestion } from "@/app/actions/exam";
import { Badge } from "@/components/ui/badge";
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
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";

type Option = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; order: number; options: Option[] };
type ActionState = { error?: string; success?: boolean } | null;

function AddQuestionDialog({
  courseId,
  nextOrder,
}: {
  courseId: string;
  nextOrder: number;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createQuestion,
    null
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success("Pregunta añadida");
      setOpen(false);
      setOptions([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
    }
  }, [state]);

  function setCorrect(idx: number) {
    setOptions(options.map((o, i) => ({ ...o, isCorrect: i === idx })));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" className="h-10 font-semibold">
            <Plus className="size-4" /> Nueva pregunta
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nueva pregunta</DialogTitle>
          <DialogDescription>
            Marca la opción correcta. Los estudiantes necesitan 70% para aprobar la evaluación.
          </DialogDescription>
        </DialogHeader>

        <form
          action={(fd) => {
            options.forEach((opt, i) => {
              fd.append(`options[${i}][text]`, opt.text);
              fd.append(`options[${i}][isCorrect]`, String(opt.isCorrect));
            });
            formAction(fd);
          }}
          className="space-y-4 py-1"
        >
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="order" value={nextOrder} />

          <div className="space-y-1.5">
            <Label htmlFor="question-text" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pregunta <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="question-text"
              name="text"
              required
              rows={2}
              autoFocus
              placeholder="Escribe la pregunta..."
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Opciones — selecciona la correcta
            </Label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrect(i)}
                    aria-label={`Marcar opción ${i + 1} como correcta`}
                    className={`shrink-0 size-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      opt.isCorrect
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input hover:border-foreground/40"
                    }`}
                  >
                    {opt.isCorrect && <Check className="size-3" />}
                  </button>
                  <Input
                    value={opt.text}
                    onChange={(e) =>
                      setOptions(
                        options.map((o, j) => (j === i ? { ...o, text: e.target.value } : o))
                      )
                    }
                    placeholder={`Opción ${i + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setOptions([...options, { text: "", isCorrect: false }])
                }
                className="h-7 text-xs text-primary hover:text-primary"
              >
                <Plus className="size-3.5" /> Añadir opción
              </Button>
            )}
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
                  Guardar pregunta
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function QuestionCard({ question, courseId }: { question: Question; courseId: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="shrink-0 size-7 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
            {question.order + 1}
          </span>
          <p className="text-sm font-medium text-foreground leading-snug">{question.text}</p>
        </div>
        <DeleteConfirmDialog
          action={() => deleteQuestion(question.id, courseId)}
          title="¿Eliminar pregunta?"
          description="Esta pregunta y sus opciones se eliminarán de la evaluación."
          triggerLabel="Eliminar pregunta"
          successMessage="Pregunta eliminada"
          variant="icon"
        />
      </div>
      <ul className="space-y-1.5 ml-10">
        {question.options.map((opt) => (
          <li
            key={opt.id}
            className={`flex items-center gap-2 text-sm ${
              opt.isCorrect ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            {opt.isCorrect ? (
              <span className="size-4 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                <Check className="size-2.5" />
              </span>
            ) : (
              <Circle className="size-4 text-muted-foreground/40" />
            )}
            <span>{opt.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ExamManager({
  courseId,
  questions,
}: {
  courseId: string;
  questions: Question[];
}) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Evaluación final
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="font-semibold">
              {questions.length} pregunta{questions.length === 1 ? "" : "s"}
            </Badge>
            <Badge variant="secondary" className="font-semibold">
              Aprobación ≥ 70%
            </Badge>
          </div>
        </div>
        <AddQuestionDialog courseId={courseId} nextOrder={questions.length} />
      </div>

      {questions.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Sin preguntas todavía"
          description="Los estudiantes necesitan aprobar la evaluación para obtener el certificado. Añade la primera pregunta para empezar."
        />
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} courseId={courseId} />
          ))}
        </div>
      )}
    </section>
  );
}
