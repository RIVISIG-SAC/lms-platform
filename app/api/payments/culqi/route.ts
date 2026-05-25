import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createCharge, toCents } from "@/lib/culqi";
import { addDays } from "@/lib/utils";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { notifyPaymentReceived } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rl = checkRateLimit(session.userId, "payment:culqi");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiados intentos. Reintenta en ${rl.retryInSeconds}s.` },
      { status: 429 },
    );
  }

  let body: { token: string; courseId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { token, courseId } = body;
  if (!token || !courseId) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Curso no disponible" }, { status: 404 });
  }

  // Verificar que no tenga una inscripción activa
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.userId, courseId } },
  });
  if (existing && ["PAID", "COMPLETED"].includes(existing.status)) {
    return NextResponse.json({ error: "Ya estás inscrito en este curso" }, { status: 409 });
  }

  // Limpiar datos previos si se está re-inscribiendo tras reprobar
  if (existing && ["FAILED", "EXPIRED"].includes(existing.status)) {
    await prisma.$transaction([
      prisma.examAttempt.deleteMany({ where: { enrollmentId: existing.id } }),
      prisma.chapterProgress.deleteMany({ where: { enrollmentId: existing.id } }),
      prisma.certificate.deleteMany({ where: { enrollmentId: existing.id } }),
    ]);
  }

  // Procesar cobro con Culqi
  let chargeId: string;
  try {
    const charge = await createCharge({
      amount: toCents(Number(course.price)),
      currencyCode: "PEN",
      email: session.email,
      sourceId: token,
      description: `Curso: ${course.title}`,
    });
    chargeId = charge.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al procesar el pago";
    return NextResponse.json({ error: message }, { status: 402 });
  }

  // Crear o actualizar inscripción
  const startDate = new Date();
  const endDate = addDays(startDate, 180);

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: session.userId, courseId } },
    create: {
      userId: session.userId,
      courseId,
      status: "PAID",
      startDate,
      endDate,
    },
    update: {
      status: "PAID",
      startDate,
      endDate,
      progressPercentage: 0,
    },
  });

  await notifyPaymentReceived({
    userId: session.userId,
    userName: session.name,
    userEmail: session.email,
    amount: Number(course.price),
    kind: "course",
    resourceTitle: course.title,
    resourceLink: `/student/courses/${courseId}`,
    notifyAdminsAlso: true,
  });

  return NextResponse.json({
    success: true,
    chargeId,
    enrollmentId: enrollment.id,
    courseId,
  });
}
