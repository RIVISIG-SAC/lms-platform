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
import { parsePersonName } from "@/lib/validations/person-name";
import {
  ENROLLMENT_ACCESS_DAYS,
  REENROLLABLE_STATUSES,
  enrollInFreeCourse,
  resetEnrollmentProgress,
} from "@/lib/enrollments";

export async function enrollFree(courseId: string, _formData: FormData): Promise<void> {
  const session = await getRequiredSession();
  if (session.role !== "STUDENT") throw new Error("No autorizado");

  const result = await enrollInFreeCourse({
    userId: session.userId,
    userName: session.name,
    userEmail: session.email,
    courseId,
  });

  if (!result.ok) throw new Error("Curso no disponible");

  redirect(
    result.alreadyEnrolled
      ? `/student/courses/${courseId}`
      : `/student/courses/${courseId}?enrolled=1`,
  );
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
  const rawName = (formData.get("name") as string)?.trim();

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
    if (!rawName) {
      return { error: "Para crear una cuenta nueva, el nombre es obligatorio." };
    }
    const parsedName = parsePersonName(rawName);
    if ("error" in parsedName) return { error: parsedName.error };
    const name = parsedName.name;

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
  const endDate = addDays(startDate, ENROLLMENT_ACCESS_DAYS);

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
  // La ficha del alumno también ofrece inscribirlo: sin esto la nueva
  // inscripción no aparecería al cerrar el diálogo.
  revalidatePath(`/admin/users/${user.id}`);

  return { success: true, userId: user.id, created };
}
