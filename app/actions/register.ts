"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { addDays } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";
import { getLegalAcceptanceVersion } from "@/lib/legal/company";
import { getClientIp, getRateLimitId } from "@/lib/security/ip";
import { checkRateLimitDb } from "@/lib/security/rateLimit";
import {
  courseSlugFromNextPath,
  sanitizeNextPath,
  withNextParam,
} from "@/lib/navigation/next-path";

export async function registerAction(_prev: unknown, formData: FormData) {
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const rlId = getRateLimitId(headersList, String(formData.get("email") ?? ""));
  const rl = await checkRateLimitDb(rlId, "auth:register");
  if (!rl.allowed) {
    return {
      error: `Demasiados registros desde tu IP. Intenta en ${Math.ceil(rl.retryInSeconds! / 60)} min.`,
    };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    dni: formData.get("dni") || undefined,
    company: formData.get("company") || undefined,
    acceptTerms: formData.get("acceptTerms"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
    return { error: firstError };
  }

  const { name, email, password, dni, company } = parsed.data;

  const confirmPassword = formData.get("confirmPassword") as string;
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con este correo electrónico." };
  }

  // El visitante llegó desde un curso ("Inscribirse gratis" o "Comprar
  // ahora"). Guardamos esa intención en el usuario para retomarla al iniciar
  // sesión aunque el `next` de la URL se pierda (p. ej. entra por /login sin
  // usar el enlace del correo). Ver `consumePendingCourse` en actions/auth.
  const next = sanitizeNextPath(formData.get("next"));
  const courseSlug = courseSlugFromNextPath(next);
  let pendingCourseId: string | null = null;

  if (courseSlug) {
    const course = await prisma.course.findFirst({
      where: { published: true, OR: [{ slug: courseSlug }, { id: courseSlug }] },
      select: { id: true },
    });
    pendingCourseId = course?.id ?? null;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const acceptedTermsIp = ip;
  const acceptedTermsVersion = getLegalAcceptanceVersion();

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
      dni: dni || null,
      company: company || null,
      acceptedTermsAt: new Date(),
      acceptedTermsIp,
      acceptedTermsVersion,
      pendingCourseId,
    },
  });

  await sendVerificationEmail(email, name, verificationToken, next);

  redirect(withNextParam("/registro/verificar", next));
}
