import { prisma } from "@/lib/prisma";

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
