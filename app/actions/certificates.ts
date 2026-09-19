"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { z } from "zod";
import { manualCertificateSchema } from "@/lib/validations/certificate";
import { personNameSchema } from "@/lib/validations/person-name";
import { notifyCertificateIssued } from "@/lib/notifications";
import { generateUniqueCertificateCode } from "@/lib/certificate-code";

export async function issueCertificateAction(enrollmentId: string) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado." };

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      certificate: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          dni: true,
          company: true,
        },
      },
      course: { select: { title: true } },
    },
  });

  if (!enrollment) return { error: "Inscripción no encontrada." };

  if (!["PAID", "COMPLETED"].includes(enrollment.status)) {
    return { error: "El estudiante debe haber pagado o completado el curso." };
  }

  const verificationCode = enrollment.certificate?.verificationCode ?? (await generateUniqueCertificateCode());
  const wasAlreadyActive = enrollment.certificate?.status === "ACTIVE";

  // Copia del titular al momento de emitir: ver `updateCertificateHolderAction`.
  const holder = {
    holderName: enrollment.user.name,
    holderDni: enrollment.user.dni,
    holderCompany: enrollment.user.company,
  };

  await prisma.certificate.upsert({
    where: { enrollmentId },
    create: {
      enrollmentId,
      verificationCode,
      status: "ACTIVE",
      issueDate: new Date(),
      ...holder,
    },
    update: {
      status: "ACTIVE",
      issueDate: new Date(),
      ...holder,
    },
  });

  if (!wasAlreadyActive) {
    await notifyCertificateIssued({
      userId: enrollment.user.id,
      userName: enrollment.user.name,
      userEmail: enrollment.user.email,
      courseTitle: enrollment.course?.title ?? "tu curso",
      verificationCode,
      notifyAdminsAlso: false, // emitido por admin: no se notifica a sí mismo
    });
  }

  revalidatePath(`/admin/users/${enrollment.userId}`);
  return { success: true };
}

export async function createManualCertificate(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado." };

  const parsed = manualCertificateSchema.safeParse({
    certificateTitle: formData.get("certificateTitle"),
    holderName: formData.get("holderName"),
    holderDni: formData.get("holderDni") ?? "",
    holderCompany: formData.get("holderCompany") ?? "",
    customDescription: formData.get("customDescription") ?? "",
    certificateValidityDays: formData.get("certificateValidityDays"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const {
    certificateTitle,
    holderName,
    holderDni,
    holderCompany,
    customDescription,
    certificateValidityDays,
  } = parsed.data;

  const issueDate = new Date();
  const expiresAt = certificateValidityDays
    ? new Date(issueDate.getTime() + certificateValidityDays * 24 * 60 * 60 * 1000)
    : null;
  const verificationCode = await generateUniqueCertificateCode();

  await prisma.certificate.create({
    data: {
      enrollmentId: null,
      courseId: null,
      certificateTitle,
      verificationCode,
      status: "ACTIVE",
      issueDate,
      expiresAt,
      holderName,
      holderDni: holderDni && holderDni !== "" ? holderDni : null,
      holderCompany: holderCompany && holderCompany !== "" ? holderCompany : null,
      customDescription:
        customDescription && customDescription !== "" ? customDescription : null,
    },
  });

  revalidatePath("/admin/certificates");
  return { success: true };
}

const holderCorrectionSchema = z.object({
  holderName: personNameSchema,
  holderDni: z
    .string()
    .trim()
    .regex(/^\d{6,12}$/, { error: "DNI debe tener entre 6 y 12 dígitos" })
    .optional()
    .or(z.literal("")),
  holderCompany: z
    .string()
    .trim()
    .max(100, { error: "Máximo 100 caracteres" })
    .optional()
    .or(z.literal("")),
});

/**
 * Corrige el titular de un certificado ya emitido.
 *
 * El nombre del certificado queda congelado al emitirlo, así que esta es la
 * única vía para arreglar un error real (una tilde, un cambio legal de
 * nombre) sin revocar y reemitir. Reservada al admin a propósito: el titular
 * no debe poder reescribir su propio certificado desde el perfil.
 */
export async function updateCertificateHolderAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado." };

  const certificateId = (formData.get("certificateId") as string)?.trim();
  if (!certificateId) return { error: "Certificado no encontrado." };

  const parsed = holderCorrectionSchema.safeParse({
    holderName: formData.get("holderName"),
    holderDni: formData.get("holderDni") ?? "",
    holderCompany: formData.get("holderCompany") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    select: { id: true, enrollment: { select: { courseId: true, userId: true } } },
  });
  if (!certificate) return { error: "Certificado no encontrado." };

  const { holderName, holderDni, holderCompany } = parsed.data;

  await prisma.certificate.update({
    where: { id: certificateId },
    data: {
      holderName,
      holderDni: holderDni ? holderDni : null,
      holderCompany: holderCompany ? holderCompany : null,
    },
  });

  revalidatePath("/admin/certificates");
  if (certificate.enrollment) {
    revalidatePath(`/admin/users/${certificate.enrollment.userId}`);
  }

  return { success: true };
}
