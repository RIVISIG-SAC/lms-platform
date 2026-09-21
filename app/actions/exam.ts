"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import {
  assertCourseAccess,
  revalidateCourseEditors,
} from "@/lib/courseAccess";
import { addDays } from "@/lib/utils";
import { notifyCertificateIssued } from "@/lib/notifications";
import { generateUniqueCertificateCode } from "@/lib/certificate-code";
import {
  EXAM_MAX_ATTEMPTS,
  EXAM_PASSING_SCORE,
  isAnswerCorrect,
  questionSchema,
  type QuestionTypeValue,
} from "@/lib/validations/exam";

// ─── Gestión de preguntas: admin e instructor propietario ───────────────────

type QuestionResult = { error?: string; success?: boolean };

/**
 * Lee el borrador de pregunta que envía el diálogo del admin y lo valida.
 *
 * Las opciones llegan como `options[i][text]` / `options[i][isCorrect]`, así
 * que hay que recorrerlas hasta que se agoten.
 */
function parseQuestionForm(
  formData: FormData,
): { data: { text: string; type: QuestionTypeValue; order: number; options: { text: string; isCorrect: boolean }[] } } | { error: string } {
  const options: { text: string; isCorrect: boolean }[] = [];
  let i = 0;
  while (formData.get(`options[${i}][text]`) !== null) {
    options.push({
      text: (formData.get(`options[${i}][text]`) as string).trim(),
      isCorrect: formData.get(`options[${i}][isCorrect]`) === "true",
    });
    i++;
  }

  const parsed = questionSchema.safeParse({
    text: (formData.get("text") as string)?.trim() ?? "",
    type: (formData.get("type") as string) ?? "SINGLE",
    order: Number(formData.get("order") ?? 0),
    options,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  return { data: parsed.data };
}

export async function createQuestion(
  _prev: unknown,
  formData: FormData
): Promise<QuestionResult> {
  const courseId = formData.get("courseId") as string;
  try {
    await assertCourseAccess(courseId);
  } catch {
    return { error: "No autorizado" };
  }

  const parsed = parseQuestionForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { text, type, order, options } = parsed.data;

  await prisma.question.create({
    data: {
      courseId,
      text,
      type,
      order,
      options: { create: options },
    },
  });

  revalidateCourseEditors(courseId);
  return { success: true };
}

export async function updateQuestion(
  _prev: unknown,
  formData: FormData
): Promise<QuestionResult> {
  const courseId = formData.get("courseId") as string;
  try {
    await assertCourseAccess(courseId);
  } catch {
    return { error: "No autorizado" };
  }

  const questionId = formData.get("questionId") as string;
  if (!questionId) return { error: "Pregunta no encontrada" };

  const parsed = parseQuestionForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { text, type, options } = parsed.data;

  await prisma.$transaction([
    prisma.questionOption.deleteMany({ where: { questionId } }),
    prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        type,
        options: { create: options },
      },
    }),
  ]);

  revalidateCourseEditors(courseId);
  return { success: true };
}

export async function deleteQuestion(questionId: string, courseId: string) {
  try {
    await assertCourseAccess(courseId);
  } catch {
    return { error: "No autorizado" };
  }

  await prisma.question.delete({ where: { id: questionId } });
  revalidateCourseEditors(courseId);
}

// ─── Student: rendir evaluación ─────────────────────────────────────────────

export type SubmitExamResult = {
  error?: string;
  score?: number;
  passed?: boolean;
  /** Número del intento que se acaba de registrar (1-based). */
  attemptNumber?: number;
  /** Intentos que le quedan al estudiante DESPUÉS de este. */
  attemptsLeft?: number;
  requiresCertPayment?: boolean;
};

export async function submitExam(
  courseId: string,
  // { questionId: [optionId, ...] } — las de respuesta única traen un solo id
  answers: Record<string, string[]>
): Promise<SubmitExamResult> {
  const session = await getRequiredSession();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.userId, courseId } },
    include: {
      course: { select: { title: true, isFree: true, certificateValidityDays: true } },
      // Los datos del titular se copian al certificado al emitirlo, así que se
      // leen de la BD y no de la sesión (el JWT puede traer un nombre viejo).
      user: { select: { name: true, dni: true, company: true } },
    },
  });

  if (!enrollment || enrollment.status !== "COMPLETED") {
    return { error: "Debes completar el curso antes de rendir la evaluación" };
  }

  const attemptCount = await prisma.examAttempt.count({
    where: { enrollmentId: enrollment.id },
  });
  if (attemptCount >= EXAM_MAX_ATTEMPTS) {
    return { error: `Has agotado tus ${EXAM_MAX_ATTEMPTS} intentos permitidos` };
  }

  // Evaluar respuestas
  const questions = await prisma.question.findMany({
    where: { courseId },
    include: { options: true },
  });

  if (questions.length === 0) return { error: "Este curso no tiene preguntas configuradas" };

  let correct = 0;
  for (const question of questions) {
    const correctIds = question.options
      .filter((o) => o.isCorrect)
      .map((o) => o.id);
    const validOptionIds = new Set(question.options.map((o) => o.id));
    // Se descartan ids que no pertenezcan a la pregunta: el cliente no decide
    // qué cuenta como respuesta válida.
    const selectedIds = (answers[question.id] ?? []).filter((id) =>
      validOptionIds.has(id),
    );

    if (isAnswerCorrect(correctIds, selectedIds)) correct++;
  }

  const score = (correct / questions.length) * 100;
  const passed = score >= EXAM_PASSING_SCORE;

  // Registrar intento
  await prisma.examAttempt.create({
    data: {
      enrollmentId: enrollment.id,
      score,
      passed,
      attemptNumber: attemptCount + 1,
    },
  });

  if (passed) {
    const certStatus = enrollment.course.isFree ? "PENDING_PAYMENT" : "ACTIVE";
    const verificationCode = await generateUniqueCertificateCode();
    const issueDate = new Date();
    const expiresAt =
      enrollment.course.certificateValidityDays != null
        ? addDays(issueDate, enrollment.course.certificateValidityDays)
        : null;
    // El nombre queda congelado en el certificado: es la evidencia de quién
    // aprobó, y editar el perfil después no debe reescribir lo ya emitido.
    // Solo un admin puede corregirlo (`updateCertificateHolderAction`).
    const holder = {
      holderName: enrollment.user.name,
      holderDni: enrollment.user.dni,
      holderCompany: enrollment.user.company,
    };

    await prisma.certificate.upsert({
      where: { enrollmentId: enrollment.id },
      create: {
        enrollmentId: enrollment.id,
        verificationCode,
        status: certStatus,
        issueDate,
        expiresAt,
        ...holder,
      },
      update: { status: certStatus, expiresAt, ...holder },
    });

    // Solo notificar cuando el certificado ya queda emitido (curso de pago).
    // Para cursos gratuitos queda PENDING_PAYMENT — la notificación se dispara
    // recién al completar el pago del certificado.
    if (certStatus === "ACTIVE") {
      await notifyCertificateIssued({
        userId: session.userId,
        userName: session.name,
        userEmail: session.email,
        courseTitle: enrollment.course.title,
        verificationCode,
        notifyAdminsAlso: true,
      });
    }

    revalidatePath(`/student/courses/${courseId}/exam`);
    revalidatePath("/student/my-courses");
    revalidatePath("/student");
  } else if (attemptCount + 1 >= EXAM_MAX_ATTEMPTS) {
    // Agotó todos los intentos: se retira el acceso al curso. La inscripción se
    // conserva en estado FAILED para que siga visible en el historial; el
    // progreso y los intentos se reinician recién al volver a inscribirse.
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "FAILED" },
    });
    // Ojo: aquí NO se revalida la ruta del examen. Hacerlo refresca el router,
    // el layout detecta el estado FAILED y redirige antes de que el estudiante
    // alcance a ver su resultado. Sale por el botón "Ir a mis cursos".
  } else {
    revalidatePath(`/student/courses/${courseId}/exam`);
  }

  // Los intentos restantes los decide el servidor y viajan con el resultado:
  // el cliente no puede deducirlos de sus props, porque la revalidación se los
  // cambia debajo mientras sigue mostrando la pantalla de resultado.
  return {
    score,
    passed,
    attemptNumber: attemptCount + 1,
    attemptsLeft: Math.max(0, EXAM_MAX_ATTEMPTS - (attemptCount + 1)),
    requiresCertPayment: passed && enrollment.course.isFree,
  };
}

