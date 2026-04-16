"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";

export async function markChapterComplete(chapterId: string, courseId: string) {
  const session = await getRequiredSession();

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.userId, courseId } },
    include: {
      course: {
        include: {
          modules: { include: { chapters: { select: { id: true } } } },
        },
      },
    },
  });

  if (!enrollment || !["PAID", "COMPLETED"].includes(enrollment.status)) {
    return { error: "Sin acceso al curso" };
  }
  if (enrollment.endDate < new Date()) {
    return { error: "El acceso a este curso ha expirado" };
  }

  // Registrar el progreso (ignorar si ya existe)
  await prisma.chapterProgress.upsert({
    where: { enrollmentId_chapterId: { enrollmentId: enrollment.id, chapterId } },
    create: { enrollmentId: enrollment.id, chapterId },
    update: {},
  });

  // Recalcular porcentaje
  const totalChapters = enrollment.course.modules.reduce(
    (acc, m) => acc + m.chapters.length,
    0
  );
  const completed = await prisma.chapterProgress.count({
    where: { enrollmentId: enrollment.id },
  });

  const progressPercentage = totalChapters > 0 ? (completed / totalChapters) * 100 : 0;
  const isCompleted = progressPercentage >= 100;

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progressPercentage,
      status: isCompleted ? "COMPLETED" : "PAID",
    },
  });

  revalidatePath(`/student/courses/${courseId}`);
  return { success: true, progressPercentage, completed: isCompleted };
}
