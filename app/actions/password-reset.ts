"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { addDays } from "@/lib/utils";
import { sendPasswordResetEmail } from "@/lib/email";
import { getRateLimitId } from "@/lib/security/ip";
import { checkRateLimitDb, pruneExpiredRateLimits } from "@/lib/security/rateLimit";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function requestPasswordResetAction(formData: FormData) {
  const headersList = await headers();
  void pruneExpiredRateLimits();

  const ipLimit = await checkRateLimitDb(
    getRateLimitId(headersList),
    "auth:password-reset:request",
  );
  if (!ipLimit.allowed) {
    redirect("/recuperar/verificar");
  }

  const parsed = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    redirect("/recuperar/verificar");
  }

  const { email } = parsed.data;

  const emailLimit = await checkRateLimitDb(
    email,
    "auth:password-reset:email",
  );
  if (!emailLimit.allowed) {
    redirect("/recuperar/verificar");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.isActive) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetTokenExp: expiresAt,
      },
    });

    await sendPasswordResetEmail(user.email, user.name, token);
  }

  redirect("/recuperar/verificar");
}

export async function resetPasswordAction(
  _prev: unknown,
  formData: FormData,
) {
  const headersList = await headers();

  const rl = await checkRateLimitDb(
    getRateLimitId(headersList),
    "auth:password-reset:confirm",
  );
  if (!rl.allowed) {
    return {
      error: `Demasiados intentos. Reintenta en ${Math.ceil(rl.retryInSeconds! / 60)} min.`,
    };
  }

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const { token, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
  });

  if (
    !user ||
    !user.passwordResetTokenExp ||
    user.passwordResetTokenExp < new Date()
  ) {
    return { error: "El enlace es inválido o ha expirado. Solicita uno nuevo." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetTokenExp: null,
      passwordExpiresAt: addDays(new Date(), 90),
      failedLoginAttempts: 0,
      lockedUntil: null,
      tokenVersion: { increment: 1 },
    },
  });

  redirect("/login?reset=ok");
}
