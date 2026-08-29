"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { manualCertificateSchema } from "@/lib/validations/certificate";
import { notifyCertificateIssued } from "@/lib/notifications";

const CERTIFICATE_CODE_PREFIX = "RIVS";

function randomCertificateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    if (i > 0 && i % 3 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${CERTIFICATE_CODE_PREFIX}-${code}`;
}

async function generateVerificationCode(): Promise<string> {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = randomCertificateCode();
    const existing = await prisma.certificate.findUnique({
      where: { verificationCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("No se pudo generar un código de verificación único.");
}

export async function issueCertificateAction(enrollmentId: string) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado." };

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      certificate: true,
      user: { select: { id: true, name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  if (!enrollment) return { error: "Inscripción no encontrada." };

  if (!["PAID", "COMPLETED"].includes(enrollment.status)) {
    return { error: "El estudiante debe haber pagado o completado el curso." };
  }

  const verificationCode = enrollment.certificate?.verificationCode ?? (await generateVerificationCode());
  const wasAlreadyActive = enrollment.certificate?.status === "ACTIVE";

  await prisma.certificate.upsert({
    where: { enrollmentId },
    create: {
      enrollmentId,
      verificationCode,
      status: "ACTIVE",
      issueDate: new Date(),
    },
    update: {
      status: "ACTIVE",
      issueDate: new Date(),
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
  const verificationCode = await generateVerificationCode();

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
