"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { addDays } from "@/lib/utils";
import { sendAdminEnrollmentEmail } from "@/lib/email";
import { notifyEnrollmentConfirmed } from "@/lib/notifications";
import {
  REENROLLABLE_STATUSES,
  resetEnrollmentProgress,
} from "@/lib/enrollments";

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

  if (existing && REENROLLABLE_STATUSES.includes(existing.status as never)) {
    await resetEnrollmentProgress(existing.id);
  }

  const startDate = new Date();
  const endDate = addDays(startDate, 180);

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: session.userId, courseId } },
    create: { userId: session.userId, courseId, status: "PAID", startDate, endDate },
    update: { status: "PAID", startDate, endDate, progressPercentage: 0 },
  });

  await notifyEnrollmentConfirmed({
    userId: session.userId,
    userName: session.name,
    userEmail: session.email,
    courseId: course.id,
    courseTitle: course.title,
    notifyAdminsAlso: true,
  });

  redirect(`/student/courses/${courseId}?enrolled=1`);
}

function generateTempPassword(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(12);
  let out = "";
  for (let i = 0; i < 12; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

type AdminEnrollState =
  | { success: true; userId: string; created: boolean }
  | { error: string }
  | null;

export async function adminEnrollUserAction(
  _prev: AdminEnrollState,
  formData: FormData,
): Promise<AdminEnrollState> {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado." };

  const courseId = (formData.get("courseId") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const name = (formData.get("name") as string)?.trim();

  if (!courseId || !email) {
    return { error: "Curso y correo son obligatorios." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Correo electrónico no válido." };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, published: true },
  });
  if (!course || !course.published) {
    return { error: "Curso no disponible." };
  }

  let user = await prisma.user.findUnique({ where: { email } });
  let tempPassword: string | null = null;
  let created = false;

  if (!user) {
    if (!name) {
      return { error: "Para crear una cuenta nueva, el nombre es obligatorio." };
    }
    tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "STUDENT",
        emailVerified: true,
        isActive: true,
        passwordExpiresAt,
      },
    });
    created = true;
  } else {
    if (user.role !== "STUDENT") {
      return { error: "Solo se pueden inscribir usuarios con rol Estudiante." };
    }
    if (!user.isActive) {
      return { error: "El usuario está desactivado." };
    }
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  });

  if (existing && ["PAID", "COMPLETED"].includes(existing.status)) {
    return { error: "El usuario ya está inscrito en este curso." };
  }

  if (existing && REENROLLABLE_STATUSES.includes(existing.status as never)) {
    await resetEnrollmentProgress(existing.id);
  }

  const startDate = new Date();
  const endDate = addDays(startDate, 180);

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId } },
    create: { userId: user.id, courseId, status: "PAID", startDate, endDate },
    update: { status: "PAID", startDate, endDate, progressPercentage: 0 },
  });

  try {
    await sendAdminEnrollmentEmail(user.email, user.name, course.title, tempPassword);
  } catch (err) {
    console.error("[adminEnrollUserAction] Error enviando email:", err);
  }

  // Notificación in-app para el estudiante (no notificamos al admin actor de su propia acción)
  await notifyEnrollmentConfirmed({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    courseId: course.id,
    courseTitle: course.title,
    notifyAdminsAlso: false,
  });

  revalidatePath("/admin/students");
  revalidatePath(`/admin/courses/${courseId}`);

  return { success: true, userId: user.id, created };
}
