"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { sendSupportEmail } from "@/lib/email";

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

  const subject = ((formData.get("subject") as string) || "").trim();
  const message = ((formData.get("message") as string) || "").trim();

  if (subject.length < 3) return { error: "El asunto debe tener al menos 3 caracteres" };
  if (subject.length > 150) return { error: "El asunto es demasiado largo (máx. 150)" };
  if (message.length < 10) return { error: "El mensaje debe tener al menos 10 caracteres" };
  if (message.length > 2000) return { error: "El mensaje es demasiado largo (máx. 2000)" };

  try {
    await sendSupportEmail({
      fromEmail: session.email,
      fromName: session.name,
      subject,
      message,
    });
  } catch (err) {
    console.error("[sendSupportMessage] Resend error", err);
    return { error: "No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos." };
  }

  return { success: true };
}
