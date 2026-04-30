"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";

export async function loginAction(_prev: unknown, formData: FormData) {
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

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
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

  await createSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  });

  const next = formData.get("next") as string | null;
  if (next && next.startsWith("/")) redirect(next);

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "INSTRUCTOR") redirect("/instructor");
  redirect("/student");
}
