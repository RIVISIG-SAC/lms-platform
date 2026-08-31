"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Check,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Save,
  Target,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from "@/app/actions/exam";
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
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import {
  AdminAlert,
  AdminChips,
  AdminField,
  AdminHint,
  DialogIcon,
} from "@/components/admin/AdminField";
import { AREA_ADMIN, CONTROL_ADMIN } from "@/components/admin/form-styles";
import { cn } from "@/lib/utils";

type Option = { id: string; text: string; isCorrect: boolean };
type Question = { id: string; text: string; order: number; options: Option[] };
type ActionState = { error?: string; success?: boolean } | null;

type DraftOption = { text: string; isCorrect: boolean };
type QuestionType = "multiple" | "boolean";

const PUNTAJE_MINIMO = 70;
const MAX_OPCIONES = 6;
const MIN_OPCIONES = 2;
const LETRAS = "ABCDEF";

const DEFAULT_MC_OPTIONS: DraftOption[] = [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

function detectType(options: Option[]): QuestionType {
  if (options.length !== 2) return "multiple";
  const texts = options.map((o) => o.text.trim().toLowerCase()).sort();
  return texts[0] === "falso" && texts[1] === "verdadero"
    ? "boolean"
    : "multiple";
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
  const initialType: QuestionType = question
    ? detectType(question.options)
    : "multiple";
  const initialOptions: DraftOption[] = question
    ? question.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect }))
    : DEFAULT_MC_OPTIONS;
  const initialText = question?.text ?? "";

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<QuestionType>(initialType);
  const [text, setText] = useState(initialText);
  const [options, setOptions] = useState<DraftOption[]>(initialOptions);

  const action = mode === "create" ? createQuestion : updateQuestion;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success(
        mode === "create" ? "Pregunta añadida" : "Pregunta actualizada",
      );
      setOpen(false);
    }
  }, [state, mode]);

  // Al abrir reiniciamos el borrador para que no se filtre entre ediciones
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
      // Conservamos qué lado era el correcto si se puede
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
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, text: value } : o)),
    );
  }

  function addOption() {
    if (options.length >= MAX_OPCIONES) return;
    setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
  }

  function removeOption(idx: number) {
    if (options.length <= MIN_OPCIONES) return;
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
  const vacias = options.filter((o) => !o.text.trim()).length;
  const listo = text.trim().length >= 3 && vacias === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogIcon icon={mode === "create" ? Plus : Pencil} />
          <DialogTitle className="text-lg">
            {mode === "create" ? "Nueva pregunta" : "Editar pregunta"}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            Marca la opción correcta. Los estudiantes necesitan{" "}
            {PUNTAJE_MINIMO}% para aprobar y tienen 2 intentos.
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
          className="space-y-4"
        >
          <input type="hidden" name="courseId" value={courseId} />
          {mode === "create" ? (
            <input type="hidden" name="order" value={nextOrder ?? 0} />
          ) : (
            <input type="hidden" name="questionId" value={question!.id} />
          )}

          <AdminField label="Tipo de pregunta">
            <AdminChips
              legend="Tipo de pregunta"
              name="question-type-ui"
              value={type}
              onChange={switchType}
              options={[
                { value: "multiple" as QuestionType, label: "Opción múltiple" },
                { value: "boolean" as QuestionType, label: "Verdadero / Falso" },
              ]}
            />
          </AdminField>

          <AdminField id="question-text" label="Enunciado">
            <Textarea
              id="question-text"
              name="text"
              required
              rows={2}
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe la pregunta..."
              className={cn(AREA_ADMIN, "min-h-20")}
            />
          </AdminField>

          <AdminField
            label={
              isBoolean ? "Respuesta correcta" : "Opciones de respuesta"
            }
            hint={
              <AdminHint>
                {isBoolean
                  ? "Elige cuál de las dos afirmaciones es la verdadera."
                  : `Pulsa el círculo para marcar la correcta. Entre ${MIN_OPCIONES} y ${MAX_OPCIONES} opciones.`}
              </AdminHint>
            }
          >
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-colors",
                    opt.isCorrect
                      ? "border-emerald-300 bg-emerald-50/60"
                      : "border-border",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setCorrect(i)}
                    aria-label={`Marcar la opción ${LETRAS[i]} como correcta`}
                    aria-pressed={opt.isCorrect}
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      opt.isCorrect
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-input hover:border-foreground/40",
                    )}
                  >
                    {opt.isCorrect && <Check className="size-3" />}
                  </button>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-bold",
                      opt.isCorrect
                        ? "text-emerald-700"
                        : "text-muted-foreground",
                    )}
                  >
                    {LETRAS[i]}
                  </span>
                  <Input
                    value={opt.text}
                    onChange={(e) => setOptionText(i, e.target.value)}
                    placeholder={`Opción ${LETRAS[i]}`}
                    className={cn(
                      CONTROL_ADMIN,
                      "h-9 flex-1 border-0 bg-transparent px-0 focus-visible:ring-0",
                    )}
                    disabled={isBoolean}
                    readOnly={isBoolean}
                  />
                  {!isBoolean && options.length > MIN_OPCIONES && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeOption(i)}
                      aria-label={`Eliminar la opción ${LETRAS[i]}`}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {!isBoolean && options.length < MAX_OPCIONES && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addOption}
                className="mt-2 font-semibold text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Plus className="size-3.5" /> Añadir opción
              </Button>
            )}
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
              disabled={pending || !listo}
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

function QuestionCard({
  question,
  numero,
  courseId,
}: {
  question: Question;
  numero: number;
  courseId: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-black tabular-nums text-primary-foreground">
          {numero}
        </span>
        <p className="min-w-0 flex-1 text-sm font-semibold leading-relaxed text-foreground">
          {question.text}
        </p>
        <div className="flex shrink-0 items-center gap-0.5">
          <QuestionDialog
            courseId={courseId}
            mode="edit"
            question={question}
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Editar pregunta"
              >
                <Pencil className="size-3.5" />
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

      <ul className="mt-3 space-y-1.5 sm:pl-10">
        {question.options.map((opt, i) => (
          <li
            key={opt.id}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm",
              opt.isCorrect
                ? "bg-emerald-50/70 font-semibold text-emerald-800"
                : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full",
                opt.isCorrect
                  ? "bg-emerald-600 text-white"
                  : "border border-muted-foreground/30",
              )}
            >
              {opt.isCorrect && <Check className="size-2.5" />}
            </span>
            <span className="text-xs font-bold">{LETRAS[i]}</span>
            <span className="min-w-0 flex-1">{opt.text}</span>
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
  const total = questions.length;
  // Con menos de 4 preguntas, un solo fallo ya baja del 70% exigido
  const pocasPreguntas = total > 0 && total < 4;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Evaluación final</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            El estudiante debe aprobarla para obtener su certificado.
          </p>
        </div>
        <QuestionDialog
          courseId={courseId}
          mode="create"
          nextOrder={total}
          trigger={
            <Button type="button" className="min-h-10 gap-2 font-semibold">
              <Plus className="size-4" /> Nueva pregunta
            </Button>
          }
        />
      </div>

      {total > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Preguntas", value: String(total) },
            { label: "Para aprobar", value: `${PUNTAJE_MINIMO}%` },
            { label: "Intentos", value: "2" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card p-3 sm:p-4"
            >
              <p className="text-xl font-black tabular-nums text-foreground sm:text-2xl">
                {value}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {pocasPreguntas && (
        <p className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-800">
          <Target className="mt-0.5 size-4 shrink-0" />
          Con solo {total} {total === 1 ? "pregunta" : "preguntas"}, un único
          error deja al estudiante por debajo del {PUNTAJE_MINIMO}%. Añade al
          menos 4 para que la nota sea representativa.
        </p>
      )}

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="size-6" />
          </span>
          <h3 className="mt-4 text-base font-bold text-foreground">
            La evaluación está vacía
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Sin preguntas los estudiantes no pueden obtener el certificado,
            aunque completen todas las clases.
          </p>
          <div className="mt-6 flex justify-center">
            <QuestionDialog
              courseId={courseId}
              mode="create"
              nextOrder={0}
              trigger={
                <Button type="button" className="gap-2 font-bold">
                  <Plus className="size-4" /> Crear la primera pregunta
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              numero={i + 1}
              courseId={courseId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
