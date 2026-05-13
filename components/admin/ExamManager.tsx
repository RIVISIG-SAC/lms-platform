"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Check,
  Circle,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { createQuestion, deleteQuestion, updateQuestion } from "@/app/actions/exam";
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

type DraftOption = { text: string; isCorrect: boolean };
type QuestionType = "multiple" | "boolean";

const TF_OPTIONS: DraftOption[] = [
  { text: "Verdadero", isCorrect: true },
  { text: "Falso", isCorrect: false },
];

const DEFAULT_MC_OPTIONS: DraftOption[] = [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

function detectType(options: Option[]): QuestionType {
  if (options.length !== 2) return "multiple";
  const texts = options.map((o) => o.text.trim().toLowerCase()).sort();
  return texts[0] === "falso" && texts[1] === "verdadero" ? "boolean" : "multiple";
}

function QuestionDialog({
  courseId,
  mode,
  question,
  nextOrder,
  trigger,
}: {
  courseId: string;
  mode: "create" | "edit";
  question?: Question;
  nextOrder?: number;
  trigger: React.ReactElement;
}) {
  const initialType: QuestionType = question ? detectType(question.options) : "multiple";
  const initialOptions: DraftOption[] = question
    ? question.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
    : DEFAULT_MC_OPTIONS;
  const initialText = question?.text ?? "";

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<QuestionType>(initialType);
  const [text, setText] = useState(initialText);
  const [options, setOptions] = useState<DraftOption[]>(initialOptions);

  const action = mode === "create" ? createQuestion : updateQuestion;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success(mode === "create" ? "Pregunta añadida" : "Pregunta actualizada");
      setOpen(false);
    }
  }, [state, mode]);

  // Reset form state on open (so edits don't leak between sessions)
  useEffect(() => {
    if (open) {
      setType(initialType);
      setText(initialText);
      setOptions(initialOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function switchType(next: QuestionType) {
    if (next === type) return;
    setType(next);
    if (next === "boolean") {
      // Preserve which side was correct if possible
      const wasTrueCorrect = options[0]?.isCorrect ?? true;
      setOptions([
        { text: "Verdadero", isCorrect: wasTrueCorrect },
        { text: "Falso", isCorrect: !wasTrueCorrect },
      ]);
    } else {
      setOptions(DEFAULT_MC_OPTIONS);
    }
  }

  function setCorrect(idx: number) {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
  }

  function setOptionText(idx: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text: value } : o)));
  }

  function addOption() {
    if (options.length >= 6) return;
    setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return;
    setOptions((prev) => {
      const removed = prev[idx];
      const next = prev.filter((_, i) => i !== idx);
      // Si quitamos la correcta, marca la primera como correcta
      if (removed.isCorrect && next.length > 0) {
        next[0] = { ...next[0], isCorrect: true };
      }
      return next;
    });
  }

  const isBoolean = type === "boolean";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva pregunta" : "Editar pregunta"}
          </DialogTitle>
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
          {mode === "create" ? (
            <>
              <input type="hidden" name="courseId" value={courseId} />
              <input type="hidden" name="order" value={nextOrder ?? 0} />
            </>
          ) : (
            <>
              <input type="hidden" name="courseId" value={courseId} />
              <input type="hidden" name="questionId" value={question!.id} />
            </>
          )}

          {/* Selector de tipo de pregunta */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tipo de pregunta
            </Label>
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => switchType("multiple")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  type === "multiple"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Opción múltiple
              </button>
              <button
                type="button"
                onClick={() => switchType("boolean")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  type === "boolean"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Verdadero / Falso
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="question-text"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Pregunta <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="question-text"
              name="text"
              required
              rows={2}
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe la pregunta..."
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isBoolean ? "Marca la respuesta correcta" : "Opciones — selecciona la correcta"}
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
                    onChange={(e) => setOptionText(i, e.target.value)}
                    placeholder={`Opción ${i + 1}`}
                    className="flex-1"
                    disabled={isBoolean}
                    readOnly={isBoolean}
                  />
                  {!isBoolean && options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(i)}
                      aria-label={`Eliminar opción ${i + 1}`}
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {!isBoolean && options.length < 6 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addOption}
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
                  {mode === "create" ? "Guardar pregunta" : "Guardar cambios"}
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
        <div className="flex items-center gap-1 shrink-0">
          <QuestionDialog
            courseId={courseId}
            mode="edit"
            question={question}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                aria-label="Editar pregunta"
              >
                <Pencil className="size-4" />
              </Button>
            }
          />
          <DeleteConfirmDialog
            action={() => deleteQuestion(question.id, courseId)}
            title="¿Eliminar pregunta?"
            description="Esta pregunta y sus opciones se eliminarán de la evaluación."
            triggerLabel="Eliminar pregunta"
            successMessage="Pregunta eliminada"
            variant="icon"
          />
        </div>
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
        <QuestionDialog
          courseId={courseId}
          mode="create"
          nextOrder={questions.length}
          trigger={
            <Button type="button" className="h-10 font-semibold">
              <Plus className="size-4" /> Nueva pregunta
            </Button>
          }
        />
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
