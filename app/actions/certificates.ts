"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { manualCertificateSchema } from "@/lib/validations/certificate";

function generateVerificationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function issueCertificateAction(enrollmentId: string) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado." };

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { certificate: true },
  });

  if (!enrollment) return { error: "Inscripción no encontrada." };

  if (!["PAID", "COMPLETED"].includes(enrollment.status)) {
    return { error: "El estudiante debe haber pagado o completado el curso." };
  }

  const verificationCode = enrollment.certificate?.verificationCode ?? generateVerificationCode();

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

  revalidatePath(`/admin/users/${enrollment.userId}`);
  return { success: true };
}

export async function createManualCertificate(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado." };

  const parsed = manualCertificateSchema.safeParse({
    courseId: formData.get("courseId"),
    holderName: formData.get("holderName"),
    holderDni: formData.get("holderDni") ?? "",
    holderCompany: formData.get("holderCompany") ?? "",
    customDescription: formData.get("customDescription") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { courseId, holderName, holderDni, holderCompany, customDescription } = parsed.data;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, certificateValidityDays: true },
  });
  if (!course) return { error: "Curso no encontrado." };

  const issueDate = new Date();
  const expiresAt = course.certificateValidityDays
    ? new Date(issueDate.getTime() + course.certificateValidityDays * 24 * 60 * 60 * 1000)
    : null;

  await prisma.certificate.create({
    data: {
      enrollmentId: null,
      courseId: course.id,
      verificationCode: generateVerificationCode(),
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
