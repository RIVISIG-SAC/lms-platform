"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { getRateLimitId } from "@/lib/security/ip";
import { checkRateLimitDb } from "@/lib/security/rateLimit";

export async function resendVerificationAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();

  if (!email) {
    return { error: "Ingresa tu correo electrónico." };
  }

  // Rate limit antes de tocar la BD para evitar email bombing. Si se supera,
  // devolvemos el mismo { success: true } genérico para no romper la
  // protección anti-enumeración (no revela si el email existe).
  const headersList = await headers();
  const rl = await checkRateLimitDb(
    getRateLimitId(headersList, email),
    "auth:verification-resend",
  );
  if (!rl.allowed) {
    return { success: true };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid user enumeration
  if (!user || user.emailVerified) {
    return { success: true };
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken, verificationTokenExp },
  });

  await sendVerificationEmail(user.email, user.name, verificationToken);

  return { success: true };
}
