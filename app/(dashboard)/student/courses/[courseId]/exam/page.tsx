import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertCircle,
  Award,
  ChevronLeft,
  Download,
  FileQuestion,
  Trophy,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { ExamRunner } from "@/components/student/ExamRunner";
import { EXAM_MAX_ATTEMPTS, EXAM_PASSING_SCORE } from "@/lib/validations/exam";
import { CertificateCheckout } from "@/components/student/CertificateCheckout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ courseId: string }> };

export default async function ExamPage({ params }: Props) {
  const { courseId } = await params;
  const session = await getRequiredSession();

  const [enrollment, questions] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId } },
      include: {
        course: { select: { slug: true, title: true, isFree: true, certificateFee: true } },
        examAttempts: { orderBy: { attemptNumber: "desc" } },
        certificate: {
          select: {
            id: true,
            verificationCode: true,
            status: true,
            issueDate: true,
          },
        },
      },
    }),
    prisma.question.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        options: { select: { id: true, text: true } }, // NO exponer isCorrect al cliente
      },
    }),
  ]);

  if (!enrollment) notFound();

  // Acceso: debe haber completado el curso
  if (enrollment.status !== "COMPLETED" && enrollment.progressPercentage < 100) {
    redirect(`/student/courses/${courseId}`);
  }

  const attemptsDone = enrollment.examAttempts.length;
  const lastAttempt = enrollment.examAttempts[0];
  const hasPassed = lastAttempt?.passed ?? false;
  const maxAttemptsReached = attemptsDone >= EXAM_MAX_ATTEMPTS;
  const puedeRendir = !hasPassed && !maxAttemptsReached;

  return (
    <main className="flex-1 overflow-y-auto bg-muted/20 [overflow-anchor:none]">
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* Encabezado */}
        <div>
          <Link
            href={`/student/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Volver al curso
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
            Evaluación final
          </p>
          <h1 className="mt-1.5 text-2xl font-black leading-snug tracking-tight text-foreground sm:text-3xl">
            {enrollment.course.title}
          </h1>
        </div>

        {/* Aprobado — certificado pendiente de pago */}
        {hasPassed && enrollment.certificate?.status === "PENDING_PAYMENT" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 text-center sm:p-8">
            <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Trophy className="size-7" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              ¡Evaluación aprobada!
            </h2>
            <p className="mt-1 text-3xl font-black tabular-nums text-amber-700">
              {lastAttempt.score.toFixed(0)}%
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-amber-800">
              Para obtener tu certificado debes completar el pago
              correspondiente.
            </p>
            <div className="mx-auto mt-5 max-w-xs">
              <CertificateCheckout
                enrollmentId={enrollment.id}
                certificateFeeInSoles={Number(enrollment.course.certificateFee)}
                customerEmail={session.email}
              />
            </div>
          </div>
        )}

        {/* Aprobado — certificado emitido */}
        {hasPassed && enrollment.certificate?.status === "ACTIVE" && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center sm:p-8">
            <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Award className="size-7" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              ¡Evaluación aprobada!
            </h2>
            <p className="mt-1 text-3xl font-black tabular-nums text-emerald-700">
              {lastAttempt.score.toFixed(0)}%
            </p>
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {enrollment.certificate.verificationCode}
            </p>
            <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={`/api/certificates/${enrollment.certificate.verificationCode}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Download className="size-4" />
                Descargar certificado
              </a>
              <Link
                href="/student/my-courses"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "min-h-11 justify-center font-semibold",
                )}
              >
                Mis cursos
              </Link>
            </div>
          </div>
        )}

        {/* Intentos agotados */}
        {!hasPassed && maxAttemptsReached && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center sm:p-8">
            <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertCircle className="size-7" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              Intentos agotados
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Tu último intento fue de{" "}
              <span className="font-semibold text-foreground">
                {lastAttempt?.score.toFixed(0)}%
              </span>{" "}
              y el mínimo requerido es {EXAM_PASSING_SCORE}%. Debes reinscribirte al
              curso para volver a intentarlo.
            </p>
            <Link
              href={`/cursos/${enrollment.course.slug}`}
              className={cn(
                buttonVariants(),
                "mt-5 min-h-11 justify-center font-semibold",
              )}
            >
              Reinscribirse
            </Link>
          </div>
        )}

        {/* Evaluación sin configurar */}
        {puedeRendir && questions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-12">
            <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <FileQuestion className="size-6" />
            </span>
            <h2 className="mt-4 text-base font-bold text-foreground">
              La evaluación aún no está disponible
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Este curso todavía no tiene preguntas configuradas. Contacta al
              administrador para habilitarla.
            </p>
          </div>
        )}

        {/* Reglas, aviso del intento anterior, formulario y resultado */}
        {puedeRendir && questions.length > 0 && (
          <ExamRunner
            courseId={courseId}
            questions={questions}
            attemptsDone={attemptsDone}
            lastScore={lastAttempt?.score ?? null}
          />
        )}
      </div>
    </main>
  );
}
