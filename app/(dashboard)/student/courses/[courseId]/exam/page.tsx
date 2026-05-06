import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { ExamForm } from "@/components/student/ExamForm";
import { CertificateCheckout } from "@/components/student/CertificateCheckout";

type Props = { params: Promise<{ courseId: string }> };

export default async function ExamPage({ params }: Props) {
  const { courseId } = await params;
  const session = await getRequiredSession();

  const [enrollment, questions] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId } },
      include: {
        course: { select: { title: true, isFree: true, certificateFee: true } },
        examAttempts: { orderBy: { attemptNumber: "desc" } },
        certificate: { select: { id: true, verificationCode: true, status: true, issueDate: true } },
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
  const maxAttemptsReached = attemptsDone >= 2;

  return (
    <main className="flex-1 overflow-y-auto [overflow-anchor:none]">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/student/courses/${courseId}`}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              ← Volver al curso
            </Link>
            <h1 className="text-xl font-semibold text-[var(--foreground)] mt-2">
              Evaluación Final
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {enrollment.course.title}
            </p>
          </div>
        </div>

        {/* Certificado pendiente de pago (curso gratuito) */}
        {hasPassed && enrollment.certificate?.status === "PENDING_PAYMENT" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-3">
            <div className="text-4xl">🎓</div>
            <h2 className="text-lg font-semibold text-amber-800">¡Evaluación Aprobada!</h2>
            <p className="text-sm text-amber-700">
              Calificación: <strong>{lastAttempt.score.toFixed(0)}%</strong>
            </p>
            <p className="text-sm text-amber-700">
              Para obtener tu certificado debes realizar el pago correspondiente.
            </p>
            <div className="pt-2 max-w-xs mx-auto">
              <CertificateCheckout
                enrollmentId={enrollment.id}
                courseTitle={enrollment.course.title}
                certificateFeeInSoles={Number(enrollment.course.certificateFee)}
              />
            </div>
          </div>
        )}

        {/* Certificado ya obtenido */}
        {hasPassed && enrollment.certificate?.status === "ACTIVE" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-3">
            <div className="text-4xl">🎓</div>
            <h2 className="text-lg font-semibold text-green-800">¡Evaluación Aprobada!</h2>
            <p className="text-sm text-green-700">
              Calificación: <strong>{lastAttempt.score.toFixed(0)}%</strong>
            </p>
            <p className="text-xs text-green-600 font-mono tracking-wider">
              Código: {enrollment.certificate.verificationCode}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <a
                href={`/api/certificates/${enrollment.certificate.verificationCode}/download`}
                className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90"
                target="_blank"
              >
                Descargar Certificado PDF
              </a>
              <Link
                href="/student/my-courses"
                className="border border-[var(--border)] text-sm px-4 py-2 rounded-md hover:bg-slate-50"
              >
                Mis Cursos
              </Link>
            </div>
          </div>
        )}

        {/* Intentos agotados sin aprobar */}
        {!hasPassed && maxAttemptsReached && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3">
            <div className="text-4xl">❌</div>
            <h2 className="text-lg font-semibold text-red-800">Intentos agotados</h2>
            <p className="text-sm text-red-700">
              Último intento: {lastAttempt?.score.toFixed(0)}% · Mínimo requerido: 70%
            </p>
            <p className="text-sm text-red-700">
              Debes reinscribirte al curso para intentarlo nuevamente.
            </p>
            <Link
              href={`/student/catalog/${courseId}`}
              className="inline-block bg-[var(--primary)] text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90"
            >
              Reinscribirse
            </Link>
          </div>
        )}

        {/* Sin preguntas configuradas */}
        {!hasPassed && !maxAttemptsReached && questions.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 text-sm text-amber-800">
            La evaluación aún no está configurada. Contacta al administrador.
          </div>
        )}

        {/* Formulario de evaluación */}
        {!hasPassed && !maxAttemptsReached && questions.length > 0 && (
          <>
            {attemptsDone > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
                Intento anterior: <strong>{lastAttempt.score.toFixed(0)}%</strong> — No aprobado.
                Te queda <strong>1 intento</strong> más.
              </div>
            )}
            <ExamForm
              courseId={courseId}
              questions={questions}
              attemptNumber={attemptsDone + 1}
            />
          </>
        )}
      </div>
    </main>
  );
}
