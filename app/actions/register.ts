"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { addDays } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";

export async function registerAction(_prev: unknown, formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const { name, email, password } = parsed.data;

  const confirmPassword = formData.get("confirmPassword") as string;
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con este correo electrónico." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "STUDENT",
      passwordExpiresAt: addDays(new Date(), 90),
      emailVerified: false,
      verificationToken,
      verificationTokenExp,
    },
  });

  await sendVerificationEmail(email, name, verificationToken);

  redirect("/registro/verificar");
}
