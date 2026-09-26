"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { checkRateLimitDb, pruneExpiredRateLimits } from "@/lib/security/rateLimit";
import { getClientIp, getRateLimitId } from "@/lib/security/ip";
import { enrollInFreeCourse } from "@/lib/enrollments";
import { coursePurchasePath, sanitizeNextPath } from "@/lib/navigation/next-path";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

function minutesUntil(date: Date): number {
  return Math.max(1, Math.ceil((date.getTime() - Date.now()) / 60_000));
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  void pruneExpiredRateLimits();

  const rlId = getRateLimitId(headersList, String(formData.get("email") ?? ""));
  const rl = await checkRateLimitDb(rlId, "auth:login");
  if (!rl.allowed) {
    return {
      error: `Demasiados intentos desde tu IP. Intenta de nuevo en ${Math.ceil(rl.retryInSeconds! / 60)} min.`,
    };
  }

  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Datos inválidos. Verifica tu email y contraseña." };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Credenciales incorrectas." };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      error: `Cuenta bloqueada temporalmente por seguridad. Intenta en ${minutesUntil(user.lockedUntil)} min.`,
    };
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    const nextAttempts = user.failedLoginAttempts + 1;
    const shouldLock = nextAttempts >= MAX_FAILED_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: shouldLock
        ? {
            failedLoginAttempts: 0,
            lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60_000),
          }
        : { failedLoginAttempts: nextAttempts },
    });

    return { error: "Credenciales incorrectas." };
  }

  if (!user.emailVerified) {
    return {
      error: "Debes verificar tu correo antes de iniciar sesión.",
    };
  }

  if (user.passwordExpiresAt < new Date()) {
    return {
      error:
        "Tu contraseña ha expirado. Contacta al administrador para restablecerla.",
    };
  }

  if (!user.isActive) {
    return {
      error: "Tu cuenta ha sido desactivada. Contacta al administrador.",
    };
  }

  // Registro de auditoría: si la conexión se corta aquí, la contraseña ya se
  // validó y no tiene sentido rechazar el login por no poder guardarlo.
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });
  } catch (err) {
    console.error("[auth] no se pudo registrar el último acceso", { userId: user.id, err });
  }

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    tokenVersion: user.tokenVersion,
  });

  // Curso pendiente: el visitante lo eligió antes de tener cuenta. Se consume
  // aquí (no al verificar el correo) porque es el primer punto del flujo donde
  // ya hay una sesión válida.
  const pendingDestination = await consumePendingCourse(user);
  if (pendingDestination) redirect(pendingDestination);

  const next = sanitizeNextPath(formData.get("next"));
  if (next) redirect(next);

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "INSTRUCTOR") redirect("/instructor");
  redirect("/student");
}

/**
 * Retoma el curso que el estudiante eligió al registrarse y limpia la marca.
 * Devuelve a dónde redirigir:
 * - gratuito: lo inscribe y va al curso;
 * - de pago: vuelve a la ficha con la intención de compra (abre el checkout);
 * - ya lo tiene: va directo al curso.
 *
 * Nunca hace fallar el login: si el curso ya no aplica (despublicado, error
 * transitorio) sólo se limpia la intención y el usuario entra normalmente.
 */
async function consumePendingCourse(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  pendingCourseId: string | null;
}): Promise<string | null> {
  if (!user.pendingCourseId) return null;

  const courseId = user.pendingCourseId;

  // Se limpia siempre y antes de actuar: así un curso que ya no aplica no
  // vuelve a intentarse en cada login.
  await prisma.user.update({
    where: { id: user.id },
    data: { pendingCourseId: null },
  });

  if (user.role !== "STUDENT") return null;

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { slug: true, published: true, isFree: true },
    });
    if (!course?.published) return null;

    if (course.isFree) {
      const result = await enrollInFreeCourse({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        courseId,
      });
      return result.ok ? `/student/courses/${result.courseId}?enrolled=1` : null;
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
      select: { status: true },
    });
    if (enrollment && ["PAID", "COMPLETED"].includes(enrollment.status)) {
      return `/student/courses/${courseId}`;
    }
    return coursePurchasePath(course.slug);
  } catch (err) {
    console.error("[loginAction] Error retomando curso pendiente:", err);
    return null;
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
