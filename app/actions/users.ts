"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function createUserAction(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado." };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  if (!name || !email || !password || !role) {
    return { error: "Todos los campos son obligatorios." };
  }

  if (!["ADMIN", "STUDENT", "INSTRUCTOR"].includes(role)) {
    return { error: "Rol inválido." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe un usuario con ese correo." };

  const passwordHash = await bcrypt.hash(password, 12);
  const passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      emailVerified: true,
      isActive: true,
      passwordExpiresAt,
    },
  });

  if (role === "INSTRUCTOR") {
    const title = (formData.get("title") as string)?.trim() || null;
    const specialization = (formData.get("specialization") as string)?.trim() || null;
    const bio = (formData.get("bio") as string)?.trim() || null;
    const linkedin = (formData.get("linkedin") as string)?.trim() || null;
    const website = (formData.get("website") as string)?.trim() || null;
    const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || null;
    await prisma.instructorProfile.create({
      data: { userId: user.id, title, specialization, bio, linkedin, website, avatarUrl },
    });
  }

  revalidatePath("/admin/users");
  return { success: true, userId: user.id };
}

export async function toggleUserActiveAction(userId: string) {
  const session = await getRequiredSession();
  if (session.role !== "ADMIN") return { error: "No autorizado." };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Usuario no encontrado." };

  const willDeactivate = user.isActive;
  if (willDeactivate && user.role === "ADMIN") {
    const activeAdmins = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (activeAdmins <= 1) {
      return {
        error:
          "Debe quedar al menos un administrador activo. No puedes desactivar al último.",
      };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

export async function changePasswordAction(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Todos los campos son obligatorios." };
  }
  if (newPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: "Usuario no encontrado." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "La contraseña actual es incorrecta." };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const passwordExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash, passwordExpiresAt },
  });

  return { success: true };
}

export async function updateUserProfileAction(_prev: unknown, formData: FormData) {
  const session = await getRequiredSession();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const dni = (formData.get("dni") as string)?.trim() || null;
  const company = (formData.get("company") as string)?.trim() || null;

  if (!name || !email) return { error: "Nombre y correo son obligatorios." };

  if (dni && !/^\d{6,12}$/.test(dni)) {
    return { error: "El DNI debe tener entre 6 y 12 dígitos." };
  }

  const existing = await prisma.user.findFirst({
    where: { email, NOT: { id: session.userId } },
  });
  if (existing) return { error: "Ese correo ya está en uso." };

  await prisma.user.update({
    where: { id: session.userId },
    data: { name, email, dni, company },
  });

  const profilePath =
    session.role === "ADMIN" ? "/admin/profile" :
    session.role === "INSTRUCTOR" ? "/instructor/profile" :
    "/student/profile";

  revalidatePath(profilePath);
  return { success: true };
}
