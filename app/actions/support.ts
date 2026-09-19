"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { sendSupportEmail } from "@/lib/email";
import { notifySupportMessageReceived } from "@/lib/notifications";
import { getRateLimitId } from "@/lib/security/ip";
import { checkRateLimitDb } from "@/lib/security/rateLimit";
import {
  SUPPORT_MESSAGE_MAX,
  SUPPORT_MESSAGE_MIN,
  SUPPORT_STATUSES,
  SUPPORT_SUBJECT_MAX,
  SUPPORT_SUBJECT_MIN,
  type SupportStatus,
} from "@/lib/validations/support";

// ─── System FAQ CRUD (admin) ───────────────────────────────────────────────

async function assertAdmin() {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") throw new Error("No autorizado");
  return session;
}

function parseSystemFaqPayload(formData: FormData) {
  const question = ((formData.get("question") as string) || "").trim();
  const answer = ((formData.get("answer") as string) || "").trim();
  const category = ((formData.get("category") as string) || "").trim();
  const published = formData.get("published") !== "false";
  return { question, answer, category, published };
}

function validateSystemFaq(data: { question: string; answer: string }) {
  if (data.question.length < 3) return "La pregunta debe tener al menos 3 caracteres";
  if (data.question.length > 200) return "La pregunta es demasiado larga (máx. 200)";
  if (data.answer.length < 3) return "La respuesta debe tener al menos 3 caracteres";
  if (data.answer.length > 2000) return "La respuesta es demasiado larga (máx. 2000)";
  return null;
}

function revalidateFaqPages() {
  revalidatePath("/admin/faq");
  revalidatePath("/student/faq");
}

export async function createSystemFaq(_prev: unknown, formData: FormData) {
  try { await assertAdmin(); } catch { return { error: "No autorizado" }; }

  const payload = parseSystemFaqPayload(formData);
  const error = validateSystemFaq(payload);
  if (error) return { error };

  const lastOrder = await prisma.systemFaq.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.systemFaq.create({
    data: {
      question: payload.question,
      answer: payload.answer,
      category: payload.category || null,
      published: payload.published,
      order: lastOrder ? lastOrder.order + 1 : 0,
    },
  });

  revalidateFaqPages();
  return { success: true };
}

export async function updateSystemFaq(_prev: unknown, formData: FormData) {
  try { await assertAdmin(); } catch { return { error: "No autorizado" }; }

  const id = formData.get("id") as string;
  if (!id) return { error: "Falta el identificador" };

  const payload = parseSystemFaqPayload(formData);
  const error = validateSystemFaq(payload);
  if (error) return { error };

  await prisma.systemFaq.update({
    where: { id },
    data: {
      question: payload.question,
      answer: payload.answer,
      category: payload.category || null,
      published: payload.published,
    },
  });

  revalidateFaqPages();
  return { success: true };
}

export async function deleteSystemFaq(faqId: string) {
  try { await assertAdmin(); } catch { return { error: "No autorizado" }; }

  await prisma.systemFaq.delete({ where: { id: faqId } });
  revalidateFaqPages();
}

// ─── Support contact ───────────────────────────────────────────────────────

export async function sendSupportMessage(_prev: unknown, formData: FormData) {
  let session;
  try {
    session = await getRequiredSession();
  } catch {
    return { error: "Debes iniciar sesión para enviar un mensaje." };
  }

  const rl = await checkRateLimitDb(
    getRateLimitId(await headers(), session.userId),
    "support:message",
  );
  if (!rl.allowed) {
    return {
      error: `Has enviado varias consultas seguidas. Inténtalo de nuevo en ${Math.ceil(rl.retryInSeconds! / 60)} min.`,
    };
  }

  const subject = ((formData.get("subject") as string) || "").trim();
  const message = ((formData.get("message") as string) || "").trim();

  if (subject.length < SUPPORT_SUBJECT_MIN)
    return { error: `El asunto debe tener al menos ${SUPPORT_SUBJECT_MIN} caracteres` };
  if (subject.length > SUPPORT_SUBJECT_MAX)
    return { error: `El asunto es demasiado largo (máx. ${SUPPORT_SUBJECT_MAX})` };
  if (message.length < SUPPORT_MESSAGE_MIN)
    return { error: `El mensaje debe tener al menos ${SUPPORT_MESSAGE_MIN} caracteres` };
  if (message.length > SUPPORT_MESSAGE_MAX)
    return { error: `El mensaje es demasiado largo (máx. ${SUPPORT_MESSAGE_MAX})` };

  // El curso lo propone el cliente, así que se comprueba contra la BD: solo se
  // adjunta si el estudiante está realmente inscrito en él. Un id inválido no
  // hace fallar el envío, simplemente se ignora.
  const courseId = ((formData.get("courseId") as string) || "").trim();
  let course: { id: string; title: string } | null = null;

  if (courseId) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.userId, courseId } },
      select: { course: { select: { id: true, title: true } } },
    });
    course = enrollment?.course ?? null;
  }

  // Se guarda ANTES de enviar el correo: si Resend falla, el mensaje del
  // estudiante sigue existiendo y el admin lo ve en su bandeja.
  const saved = await prisma.supportMessage.create({
    data: {
      userId: session.userId,
      name: session.name,
      email: session.email,
      subject,
      message,
      courseId: course?.id ?? null,
      courseTitle: course?.title ?? null,
    },
    select: { id: true },
  });

  try {
    await sendSupportEmail({
      fromEmail: session.email,
      fromName: session.name,
      subject,
      message,
      courseTitle: course?.title ?? null,
    });
    await prisma.supportMessage.update({
      where: { id: saved.id },
      data: { emailSent: true },
    });
  } catch (err) {
    // El correo es solo el aviso; la consulta ya está registrada, así que no
    // se le devuelve un error al estudiante ni se le pide reescribirla.
    console.error("[sendSupportMessage] Resend error", err);
    await prisma.supportMessage.update({
      where: { id: saved.id },
      data: {
        emailError: err instanceof Error ? err.message : "Error desconocido",
      },
    });
  }

  await notifySupportMessageReceived({
    messageId: saved.id,
    fromName: session.name,
    subject,
  });

  revalidatePath("/admin/support");
  return { success: true };
}

// ─── Bandeja de soporte (admin) ────────────────────────────────────────────

/** Cambia el estado de una consulta desde la bandeja del admin. */
export async function updateSupportMessageStatus(
  messageId: string,
  status: SupportStatus,
) {
  try {
    await assertAdmin();
  } catch {
    return { error: "No autorizado" };
  }

  if (!SUPPORT_STATUSES.includes(status)) return { error: "Estado inválido" };

  await prisma.supportMessage.update({
    where: { id: messageId },
    data: {
      status,
      answeredAt: status === "ANSWERED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/support");
  return { success: true };
}
