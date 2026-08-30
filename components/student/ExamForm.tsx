"use client";

import { useRef, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Send,
  Trophy,
} from "lucide-react";
import { submitExam } from "@/app/actions/exam";
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

type Option = { id: string; text: string };
type Question = { id: string; text: string; order: number; options: Option[] };

type Props = {
  courseId: string;
  questions: Question[];
  attemptNumber: number;
};

type Result = { score: number; passed: boolean } | null;

const PUNTAJE_MINIMO = 70;
const LETRAS = "ABCDEFGH";

export function ExamForm({ courseId, questions, attemptNumber }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result>(null);
  const [error, setError] = useState<string | null>(null);
  const [resaltarFaltantes, setResaltarFaltantes] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();

  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  const respondidas = Object.keys(answers).length;
  const total = questions.length;
  const allAnswered = respondidas === total;
  const avance = total > 0 ? Math.round((respondidas / total) * 100) : 0;

  function intentarEnviar() {
    if (!allAnswered) {
      setResaltarFaltantes(true);
      setError(
        `Te faltan ${total - respondidas} ${total - respondidas === 1 ? "pregunta" : "preguntas"} por responder.`,
      );
      const faltante = questions.find((q) => !answers[q.id]);
      if (faltante) {
        refs.current[faltante.id]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }
    setError(null);
    setConfirmando(true);
  }

  function enviar() {
    setConfirmando(false);
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
    const aprobado = result.passed;
    return (
      <div
        className={cn(
          "rounded-2xl border p-8 text-center",
          aprobado
            ? "border-emerald-200 bg-emerald-50/60"
            : "border-destructive/20 bg-destructive/5",
        )}
      >
        <span
          className={cn(
            "mx-auto inline-flex size-14 items-center justify-center rounded-2xl",
            aprobado
              ? "bg-emerald-100 text-emerald-700"
              : "bg-destructive/10 text-destructive",
          )}
        >
          {aprobado ? (
            <Trophy className="size-7" />
          ) : (
            <RotateCcw className="size-7" />
          )}
        </span>

        <p
          className={cn(
            "mt-5 text-4xl font-black tabular-nums tracking-tight",
            aprobado ? "text-emerald-700" : "text-destructive",
          )}
        >
          {result.score.toFixed(0)}%
        </p>
        <p
          className={cn(
            "mt-1 text-lg font-bold",
            aprobado ? "text-emerald-800" : "text-foreground",
          )}
        >
          {aprobado ? "¡Evaluación aprobada!" : "No aprobaste esta vez"}
        </p>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {aprobado
            ? "Tu certificado ha sido generado. Puedes descargarlo desde Mis cursos."
            : attemptNumber >= 2
              ? "Has agotado tus 2 intentos, por lo que perdiste el acceso al curso. Seguirá en tu historial y, si te vuelves a inscribir, empezarás desde cero."
              : `Necesitas al menos ${PUNTAJE_MINIMO}% para aprobar. Te queda 1 intento: repasa el material y vuelve a intentarlo.`}
        </p>

        <a
          href={
            aprobado
              ? "/student/certificates"
              : attemptNumber >= 2
                ? "/student/my-courses"
                : `/student/courses/${courseId}`
          }
          className={cn(
            "mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-opacity hover:opacity-90",
            aprobado
              ? "bg-emerald-600 text-white"
              : "bg-primary text-primary-foreground",
          )}
        >
          {aprobado
            ? "Ver mi certificado"
            : attemptNumber >= 2
              ? "Ir a mis cursos"
              : "Volver al curso"}
          <ArrowRight className="size-4" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Barra de avance fija */}
      <div className="sticky top-0 z-10 -mx-1 rounded-xl border border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs font-semibold">
          <span className="text-muted-foreground">
            Intento{" "}
            <span className="text-foreground">{attemptNumber} de 2</span>
          </span>
          <span className="text-muted-foreground">
            Mínimo{" "}
            <span className="text-foreground">{PUNTAJE_MINIMO}%</span>
          </span>
          <span className="tabular-nums text-foreground">
            {respondidas} / {total} respondidas
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${avance}%` }}
          />
        </div>
      </div>

      {/* Preguntas */}
      <div className="space-y-4">
        {questions.map((question, qi) => {
          const sinResponder = resaltarFaltantes && !answers[question.id];

          return (
            <div
              key={question.id}
              ref={(el) => {
                refs.current[question.id] = el;
              }}
              className={cn(
                "rounded-2xl border bg-card p-5 transition-colors sm:p-6",
                sinResponder ? "border-amber-300 bg-amber-50/40" : "border-border",
              )}
            >
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-black text-primary-foreground">
                  {qi + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-relaxed text-foreground sm:text-base">
                    {question.text}
                  </p>
                  {sinResponder && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                      <AlertCircle className="size-3.5" />
                      Sin responder
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 sm:pl-10">
                {question.options.map((opt, oi) => {
                  const selected = answers[question.id] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        "relative flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40",
                        selected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-border hover:border-primary/30 hover:bg-accent/40",
                      )}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={opt.id}
                        checked={selected}
                        onChange={() => {
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: opt.id,
                          }));
                          setError(null);
                        }}
                        className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
                      />
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          selected
                            ? "border-primary bg-primary"
                            : "border-border",
                        )}
                      >
                        {selected && (
                          <span className="size-1.5 rounded-full bg-primary-foreground" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-xs font-bold",
                          selected ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {LETRAS[oi]}
                      </span>
                      <span
                        className={cn(
                          "text-sm leading-snug",
                          selected
                            ? "font-medium text-foreground"
                            : "text-foreground",
                        )}
                      >
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <Button
        onClick={intentarEnviar}
        disabled={pending}
        className="min-h-12 w-full text-base font-bold"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Enviando evaluación...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Enviar evaluación
          </>
        )}
      </Button>

      {/* Confirmación de envío */}
      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <span className="mb-2 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" />
            </span>
            <DialogTitle className="text-lg">¿Enviar la evaluación?</DialogTitle>
            <DialogDescription className="leading-relaxed">
              Respondiste las {total} preguntas. Una vez enviada no podrás
              modificar tus respuestas
              {attemptNumber < 2
                ? " y usarás uno de tus 2 intentos."
                : ". Este es tu último intento."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              className="w-full font-semibold sm:w-auto"
              onClick={() => setConfirmando(false)}
            >
              Revisar respuestas
            </Button>
            <Button
              className="w-full font-semibold sm:w-auto"
              onClick={enviar}
            >
              Sí, enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
