import { prisma } from "@/lib/prisma";
import { addDays } from "@/lib/utils";
import { notifyEnrollmentConfirmed, sendCourseWelcome } from "@/lib/notifications";

/** Estados desde los que un estudiante puede volver a inscribirse a un curso. */
export const REENROLLABLE_STATUSES = ["FAILED", "EXPIRED"] as const;

/**
 * Limpia el rastro del intento anterior cuando un estudiante vuelve a
 * inscribirse a un curso que reprobó o cuyo acceso expiró: progreso de
 * capítulos, intentos de evaluación y certificados no emitidos.
 *
 * Los certificados ACTIVE se conservan a propósito: son la evidencia de una
 * aprobación previa y no deben desaparecer al reiniciar el curso.
 *
 * La inscripción en sí NO se borra — se reutiliza con `progressPercentage: 0`
 * para que el curso siga apareciendo en el historial del estudiante.
 */
export async function resetEnrollmentProgress(enrollmentId: string) {
  await prisma.$transaction([
    prisma.examAttempt.deleteMany({ where: { enrollmentId } }),
    prisma.chapterProgress.deleteMany({ where: { enrollmentId } }),
    prisma.certificate.deleteMany({
      where: { enrollmentId, status: { not: "ACTIVE" } },
    }),
  ]);
}

/** Dias de acceso que otorga una inscripcion. */
export const ENROLLMENT_ACCESS_DAYS = 180;

export type FreeEnrollOutcome =
  | { ok: true; courseId: string; alreadyEnrolled: boolean }
  | { ok: false; reason: "COURSE_UNAVAILABLE" };

/**
 * Inscribe a un estudiante en un curso gratuito de forma idempotente.
 *
 * Es la unica fuente de verdad de la inscripcion gratuita: la usan tanto la
 * server action `enrollFree` (click en "Inscribirse gratis") como el login,
 * que consume la intencion guardada en `User.pendingCourseId` cuando el
 * visitante eligio el curso antes de tener cuenta.
 */
export async function enrollInFreeCourse(params: {
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
}): Promise<FreeEnrollOutcome> {
  const { userId, userName, userEmail, courseId } = params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, published: true, isFree: true },
  });

  if (!course || !course.published || !course.isFree) {
    return { ok: false, reason: "COURSE_UNAVAILABLE" };
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing && ["PAID", "COMPLETED"].includes(existing.status)) {
    return { ok: true, courseId, alreadyEnrolled: true };
  }

  if (existing && REENROLLABLE_STATUSES.includes(existing.status as never)) {
    await resetEnrollmentProgress(existing.id);
  }

  const startDate = new Date();
  const endDate = addDays(startDate, ENROLLMENT_ACCESS_DAYS);

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId, status: "PAID", startDate, endDate },
    update: { status: "PAID", startDate, endDate, progressPercentage: 0 },
  });

  await notifyEnrollmentConfirmed({
    userId,
    userName,
    userEmail,
    courseId: course.id,
    courseTitle: course.title,
    notifyAdminsAlso: true,
  });

  await sendCourseWelcome({
    userEmail,
    userName,
    courseId: course.id,
    courseTitle: course.title,
    accessUntil: endDate,
  });

  return { ok: true, courseId, alreadyEnrolled: false };
}
