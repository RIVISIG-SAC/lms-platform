"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { addDays } from "@/lib/utils";

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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "STUDENT",
      passwordExpiresAt: addDays(new Date(), 90),
    },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  const next = formData.get("next") as string | null;
  redirect(next && next.startsWith("/") ? next : "/student");
}
