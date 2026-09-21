"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ListChecks,
  RefreshCcw,
  RotateCcw,
  Target,
  Trophy,
} from "lucide-react";
import { ExamForm, type ExamResult, type Question } from "@/components/student/ExamForm";
import { EXAM_MAX_ATTEMPTS, EXAM_PASSING_SCORE } from "@/lib/validations/exam";
import { cn } from "@/lib/utils";

type Props = {
  courseId: string;
  questions: Question[];
  /** Intentos ya registrados antes de entrar a esta pantalla. */
  attemptsDone: number;
  /** Nota del intento anterior, para el aviso previo. */
  lastScore: number | null;
};

/**
 * Envuelve la evaluación y su resultado.
 *
 * El resultado vive aquí, y no dentro del formulario, porque al registrar un
 * intento el servidor revalida la ruta: si la cabecera con los intentos y el
 * aviso del intento anterior se pintaran en el servidor, se actualizarían
 * detrás de la pantalla de resultado y el estudiante vería a la vez "es tu
 * último intento" y su nota recién enviada. Mientras hay resultado, esta
 * pantalla es lo único que se muestra, y los intentos restantes salen de lo
 * que devolvió el servidor al registrar el intento, no de las props.
 */
export function ExamRunner({ courseId, questions, attemptsDone, lastScore }: Props) {
  const [result, setResult] = useState<ExamResult | null>(null);

  if (result) return <Resultado courseId={courseId} result={result} />;

  const intentoActual = attemptsDone + 1;

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: ListChecks,
            label: "Preguntas",
            value: String(questions.length),
          },
          {
            icon: Target,
            label: "Para aprobar",
            value: `${EXAM_PASSING_SCORE}%`,
          },
          {
            icon: RefreshCcw,
            label: "Intento actual",
            value: `${intentoActual} de ${EXAM_MAX_ATTEMPTS}`,
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-3 sm:p-4"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </span>
            <p className="mt-2 text-base font-black tabular-nums text-foreground sm:text-lg">
              {value}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
          </div>
        ))}
      </div>

      {attemptsDone > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="leading-relaxed">
            En tu intento anterior obtuviste{" "}
            <strong>{(lastScore ?? 0).toFixed(0)}%</strong> y no aprobaste.
            {intentoActual >= EXAM_MAX_ATTEMPTS ? (
              <>
                {" "}
                Este es tu <strong>último intento</strong>.
              </>
            ) : (
              <>
                {" "}
                Te{" "}
                <strong>
                  {EXAM_MAX_ATTEMPTS - attemptsDone === 1
                    ? "queda 1 intento"
                    : `quedan ${EXAM_MAX_ATTEMPTS - attemptsDone} intentos`}
                </strong>
                .
              </>
            )}
          </p>
        </div>
      )}

      <ExamForm
        courseId={courseId}
        questions={questions}
        attemptNumber={intentoActual}
        maxAttempts={EXAM_MAX_ATTEMPTS}
        onFinish={setResult}
      />
    </>
  );
}

function Resultado({
  courseId,
  result,
}: {
  courseId: string;
  result: ExamResult;
}) {
  const aprobado = result.passed;
  const sinIntentos = result.attemptsLeft === 0;

  const mensaje = aprobado
    ? "Tu certificado ha sido generado. Puedes descargarlo desde Mis cursos."
    : sinIntentos
      ? `Has agotado tus ${EXAM_MAX_ATTEMPTS} intentos, por lo que perdiste el acceso al curso. Seguirá en tu historial y, si te vuelves a inscribir, empezarás desde cero.`
      : `Necesitas al menos ${EXAM_PASSING_SCORE}% para aprobar. Te ${
          result.attemptsLeft === 1
            ? "queda 1 intento"
            : `quedan ${result.attemptsLeft} intentos`
        }: repasa el material y vuelve a intentarlo.`;

  const destino = aprobado
    ? { href: "/student/certificates", label: "Ver mi certificado" }
    : sinIntentos
      ? { href: "/student/my-courses", label: "Ir a mis cursos" }
      : { href: `/student/courses/${courseId}`, label: "Volver al curso" };

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
        {aprobado ? <Trophy className="size-7" /> : <RotateCcw className="size-7" />}
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
        {mensaje}
      </p>

      <a
        href={destino.href}
        className={cn(
          "mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-opacity hover:opacity-90",
          aprobado
            ? "bg-emerald-600 text-white"
            : "bg-primary text-primary-foreground",
        )}
      >
        {destino.label}
        <ArrowRight className="size-4" />
      </a>
    </div>
  );
}
