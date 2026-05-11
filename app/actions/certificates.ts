"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";

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
