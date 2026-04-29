"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { addDays } from "@/lib/utils";

export async function enrollFree(courseId: string, _formData: FormData): Promise<void> {
  const session = await getRequiredSession();
  if (session.role !== "STUDENT") throw new Error("No autorizado");

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published || !course.isFree) {
    throw new Error("Curso no disponible");
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.userId, courseId } },
  });

  if (existing && ["PAID", "COMPLETED"].includes(existing.status)) {
    redirect(`/student/courses/${courseId}`);
  }

  if (existing && ["FAILED", "EXPIRED"].includes(existing.status)) {
    await prisma.$transaction([
      prisma.examAttempt.deleteMany({ where: { enrollmentId: existing.id } }),
      prisma.chapterProgress.deleteMany({ where: { enrollmentId: existing.id } }),
      prisma.certificate.deleteMany({ where: { enrollmentId: existing.id } }),
    ]);
  }

  const startDate = new Date();
  const endDate = addDays(startDate, 180);

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: session.userId, courseId } },
    create: { userId: session.userId, courseId, status: "PAID", startDate, endDate },
    update: { status: "PAID", startDate, endDate, progressPercentage: 0 },
  });

  redirect(`/student/courses/${courseId}?enrolled=1`);
}
