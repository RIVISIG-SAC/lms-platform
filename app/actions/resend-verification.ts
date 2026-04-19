"use server";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function resendVerificationAction(_prev: unknown, formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();

  if (!email) {
    return { error: "Ingresa tu correo electrónico." };
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
