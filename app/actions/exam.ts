"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { addDays } from "@/lib/utils";
import { notifyCertificateIssued } from "@/lib/notifications";

// ─── Admin: gestión de preguntas ────────────────────────────────────────────

export async function createQuestion(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const courseId = formData.get("courseId") as string;
  const text = (formData.get("text") as string)?.trim();
  const order = Number(formData.get("order"));

  if (!text || text.length < 5) return { error: "La pregunta debe tener al menos 5 caracteres" };

  // Recopilar opciones dinámicamente desde el form
  const options: { text: string; isCorrect: boolean }[] = [];
  let i = 0;
  while (formData.get(`options[${i}][text]`) !== null) {
    options.push({
      text: (formData.get(`options[${i}][text]`) as string).trim(),
      isCorrect: formData.get(`options[${i}][isCorrect]`) === "true",
    });
    i++;
  }

  if (options.length < 2) return { error: "Debe tener al menos 2 opciones" };
  if (options.filter((o) => o.isCorrect).length !== 1)
    return { error: "Debe haber exactamente una respuesta correcta" };
  if (options.some((o) => !o.text)) return { error: "Todas las opciones deben tener texto" };

  await prisma.question.create({
    data: {
      courseId,
      text,
      order,
      options: { create: options },
    },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function updateQuestion(
  _prev: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const questionId = formData.get("questionId") as string;
  const courseId = formData.get("courseId") as string;
  const text = (formData.get("text") as string)?.trim();

  if (!questionId) return { error: "Pregunta no encontrada" };
  if (!text || text.length < 5) return { error: "La pregunta debe tener al menos 5 caracteres" };

  const options: { text: string; isCorrect: boolean }[] = [];
  let i = 0;
  while (formData.get(`options[${i}][text]`) !== null) {
    options.push({
      text: (formData.get(`options[${i}][text]`) as string).trim(),
      isCorrect: formData.get(`options[${i}][isCorrect]`) === "true",
    });
    i++;
  }

  if (options.length < 2) return { error: "Debe tener al menos 2 opciones" };
  if (options.length > 6) return { error: "Máximo 6 opciones" };
  if (options.filter((o) => o.isCorrect).length !== 1)
    return { error: "Debe haber exactamente una respuesta correcta" };
  if (options.some((o) => !o.text)) return { error: "Todas las opciones deben tener texto" };

  await prisma.$transaction([
    prisma.questionOption.deleteMany({ where: { questionId } }),
    prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        options: { create: options },
      },
    }),
  ]);

  revalidatePath(`/admin/courses/${courseId}`);
  return { success: true };
}

export async function deleteQuestion(questionId: string, courseId: string) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath(`/admin/courses/${courseId}`);
}

// ─── Student: rendir evaluación ─────────────────────────────────────────────

export async function submitExam(
  courseId: string,
  answers: Record<string, string> // { questionId: selectedOptionId }
): Promise<{ error?: string; score?: number; passed?: boolean; requiresCertPayment?: boolean }> {
  const session = await getRequiredSession();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.userId, courseId } },
    include: { course: { select: { title: true, isFree: true, certificateValidityDays: true } } },
  });

  if (!enrollment || enrollment.status !== "COMPLETED") {
    return { error: "Debes completar el curso antes de rendir la evaluación" };
  }

  const attemptCount = await prisma.examAttempt.count({
    where: { enrollmentId: enrollment.id },
  });
  if (attemptCount >= 2) {
    return { error: "Has agotado tus 2 intentos permitidos" };
  }

  // Evaluar respuestas
  const questions = await prisma.question.findMany({
    where: { courseId },
    include: { options: true },
  });

  if (questions.length === 0) return { error: "Este curso no tiene preguntas configuradas" };

  let correct = 0;
  for (const question of questions) {
    const selectedId = answers[question.id];
    const correctOption = question.options.find((o) => o.isCorrect);
    if (selectedId && correctOption && selectedId === correctOption.id) {
      correct++;
    }
  }

  const score = (correct / questions.length) * 100;
  const passed = score >= 70;

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
    const verificationCode = generateVerificationCode();
    const issueDate = new Date();
    const expiresAt =
      enrollment.course.certificateValidityDays != null
        ? addDays(issueDate, enrollment.course.certificateValidityDays)
        : null;
    await prisma.certificate.upsert({
      where: { enrollmentId: enrollment.id },
      create: { enrollmentId: enrollment.id, verificationCode, status: certStatus, issueDate, expiresAt },
      update: { status: certStatus, expiresAt },
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
  } else if (attemptCount + 1 >= 2) {
    // Agotó intentos sin aprobar
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: "FAILED" },
    });
  }

  revalidatePath(`/student/courses/${courseId}/exam`);
  return { score, passed, requiresCertPayment: passed && enrollment.course.isFree };
}

function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code; // Ej: ABCD-EFGH-IJKL
}
