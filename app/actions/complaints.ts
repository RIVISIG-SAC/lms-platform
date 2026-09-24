"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import {
  sendComplaintReceiptEmail,
  sendComplaintResponseEmail,
} from "@/lib/email";
import { LEGAL_COMPANY } from "@/lib/legal/company";
import { notifyComplaintReceived } from "@/lib/notifications";
import { getRateLimitId } from "@/lib/security/ip";
import { checkRateLimitDb } from "@/lib/security/rateLimit";
import {
  COMPLAINT_DOCUMENT_LABELS,
  COMPLAINT_RESPONSE_BUSINESS_DAYS,
  COMPLAINT_TYPE_LABELS,
  complaintResponseSchema,
  complaintSchema,
  formatComplaintCode,
} from "@/lib/validations/complaint";

export type ComplaintFormState =
  | { error: string; fieldErrors?: Record<string, string> }
  | { success: true; code: string; email: string; emailSent: boolean }
  | null;

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

// ─── Registro público ──────────────────────────────────────────────────────

/**
 * Registra una hoja de reclamación. Es pública: el Reglamento no permite
 * condicionar el Libro a tener cuenta ni a haber comprado.
 */
export async function submitComplaint(
  _prev: ComplaintFormState,
  formData: FormData,
): Promise<ComplaintFormState> {
  const rl = await checkRateLimitDb(
    getRateLimitId(await headers()),
    "complaint:submit",
  );
  if (!rl.allowed) {
    return {
      error: `Has enviado varias hojas seguidas. Inténtalo de nuevo en ${Math.ceil(rl.retryInSeconds! / 60)} min.`,
    };
  }

  const parsed = complaintSchema.safeParse({
    consumerName: readString(formData, "consumerName"),
    documentType: readString(formData, "documentType"),
    documentNumber: readString(formData, "documentNumber") ?? "",
    address: readString(formData, "address"),
    phone: readString(formData, "phone") ?? "",
    email: readString(formData, "email"),
    isMinor: formData.get("isMinor") === "on",
    guardianName: readString(formData, "guardianName") || undefined,
    itemType: readString(formData, "itemType"),
    amount: readString(formData, "amount") || undefined,
    itemDescription: readString(formData, "itemDescription"),
    type: readString(formData, "type"),
    detail: readString(formData, "detail"),
    request: readString(formData, "request"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { error: "Revisa los campos marcados.", fieldErrors };
  }

  const data = parsed.data;

  // Se guarda ANTES de enviar la constancia: la hoja tiene valor legal y no
  // puede depender de que Resend responda.
  const complaint = await prisma.complaint.create({
    data: {
      consumerName: data.consumerName,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      address: data.address,
      phone: data.phone,
      email: data.email,
      isMinor: data.isMinor,
      guardianName: data.isMinor ? data.guardianName : null,
      itemType: data.itemType === "PRODUCTO" ? "Producto" : "Servicio",
      amount: data.amount ?? null,
      itemDescription: data.itemDescription,
      type: data.type,
      detail: data.detail,
      request: data.request,
    },
    select: { id: true, number: true, createdAt: true, itemType: true },
  });

  const code = formatComplaintCode(complaint.number, complaint.createdAt);
  const typeLabel = COMPLAINT_TYPE_LABELS[data.type];

  let emailSent = false;
  try {
    await sendComplaintReceiptEmail({
      code,
      createdAt: complaint.createdAt,
      typeLabel,
      consumerName: data.consumerName,
      documentLabel: COMPLAINT_DOCUMENT_LABELS[data.documentType],
      documentNumber: data.documentNumber,
      address: data.address,
      phone: data.phone,
      email: data.email,
      guardianName: data.isMinor ? (data.guardianName ?? null) : null,
      itemType: complaint.itemType,
      amount: data.amount ?? null,
      itemDescription: data.itemDescription,
      detail: data.detail,
      request: data.request,
      company: {
        razonSocial: LEGAL_COMPANY.razonSocial,
        ruc: LEGAL_COMPANY.ruc,
        direccion: LEGAL_COMPANY.direccion,
      },
      deadlineDays: COMPLAINT_RESPONSE_BUSINESS_DAYS,
    });
    emailSent = true;
    await prisma.complaint.update({
      where: { id: complaint.id },
      data: { receiptEmailSent: true },
    });
  } catch (err) {
    console.error("[submitComplaint] Resend error", err);
    await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        emailError: err instanceof Error ? err.message : "Error desconocido",
      },
    });
  }

  await notifyComplaintReceived({
    code,
    typeLabel,
    consumerName: data.consumerName,
  });

  revalidatePath("/admin/complaints");
  return { success: true, code, email: data.email, emailSent };
}

// ─── Respuesta del proveedor (admin) ───────────────────────────────────────

/**
 * Guarda la respuesta y la envía al consumidor. Una hoja respondida no se
 * vuelve a responder: la respuesta forma parte del registro legal.
 */
export async function respondComplaint(
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean; emailSent?: boolean }> {
  let session;
  try {
    session = await getRequiredSession();
  } catch {
    return { error: "No autorizado" };
  }
  if (session.role !== "ADMIN") return { error: "No autorizado" };

  const parsed = complaintResponseSchema.safeParse({
    complaintId: readString(formData, "complaintId"),
    response: readString(formData, "response"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { complaintId, response } = parsed.data;

  // `updateMany` con `status: PENDING` evita que dos admins respondan a la vez.
  const { count } = await prisma.complaint.updateMany({
    where: { id: complaintId, status: "PENDING" },
    data: {
      status: "ANSWERED",
      response,
      respondedAt: new Date(),
      respondedById: session.userId,
    },
  });
  if (count === 0) return { error: "Esta hoja ya fue respondida." };

  const complaint = await prisma.complaint.findUniqueOrThrow({
    where: { id: complaintId },
    select: {
      number: true,
      createdAt: true,
      consumerName: true,
      email: true,
      type: true,
      detail: true,
    },
  });

  let emailSent = false;
  try {
    await sendComplaintResponseEmail({
      code: formatComplaintCode(complaint.number, complaint.createdAt),
      consumerName: complaint.consumerName,
      email: complaint.email,
      typeLabel: COMPLAINT_TYPE_LABELS[complaint.type],
      detail: complaint.detail,
      response,
    });
    emailSent = true;
    await prisma.complaint.update({
      where: { id: complaintId },
      data: { responseEmailSent: true, emailError: null },
    });
  } catch (err) {
    console.error("[respondComplaint] Resend error", err);
    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        emailError: err instanceof Error ? err.message : "Error desconocido",
      },
    });
  }

  revalidatePath("/admin/complaints");
  return { success: true, emailSent };
}
