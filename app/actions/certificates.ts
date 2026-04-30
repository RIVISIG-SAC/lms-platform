"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";

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

  await prisma.certificate.upsert({
    where: { enrollmentId },
    create: {
      enrollmentId,
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
