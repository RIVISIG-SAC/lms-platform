"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { getClientIp } from "@/lib/security/ip";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

function minutesUntil(date: Date): number {
  return Math.max(1, Math.ceil((date.getTime() - Date.now()) / 60_000));
}

export async function loginAction(_prev: unknown, formData: FormData) {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const rl = checkRateLimit(ip, "auth:login");
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

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: ip,
    },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    tokenVersion: user.tokenVersion,
  });

  const next = formData.get("next") as string | null;
  if (next && next.startsWith("/")) redirect(next);

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "INSTRUCTOR") redirect("/instructor");
  redirect("/student");
}
