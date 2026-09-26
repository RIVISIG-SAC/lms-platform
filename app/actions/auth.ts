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
import { sanitizeNextPath } from "@/lib/navigation/next-path";

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

  // Inscripción pendiente: el visitante eligió un curso gratuito antes de
  // tener cuenta. Se consume aquí (no al verificar el correo) porque es el
  // primer punto del flujo donde ya hay una sesión válida.
  const pendingCourseId = await consumePendingEnrollment(user);
  if (pendingCourseId) redirect(`/student/courses/${pendingCourseId}?enrolled=1`);

  const next = sanitizeNextPath(formData.get("next"));
  if (next) redirect(next);

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "INSTRUCTOR") redirect("/instructor");
  redirect("/student");
}

/**
 * Inscribe al estudiante en el curso gratuito que dejó pendiente al
 * registrarse y limpia la marca. Devuelve el id del curso si quedó inscrito.
 *
 * Nunca hace fallar el login: si la inscripción no se puede completar (curso
 * despublicado, pasó a ser de pago, error transitorio) sólo se limpia la
 * intención y el usuario entra normalmente.
 */
async function consumePendingEnrollment(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  pendingCourseId: string | null;
}): Promise<string | null> {
  if (!user.pendingCourseId) return null;

  const courseId = user.pendingCourseId;

  // Se limpia siempre y antes de inscribir: así un curso que ya no aplica no
  // vuelve a intentarse en cada login.
  await prisma.user.update({
    where: { id: user.id },
    data: { pendingCourseId: null },
  });

  if (user.role !== "STUDENT") return null;

  try {
    const result = await enrollInFreeCourse({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      courseId,
    });
    return result.ok ? result.courseId : null;
  } catch (err) {
    console.error("[loginAction] Error inscribiendo curso pendiente:", err);
    return null;
  }
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}
