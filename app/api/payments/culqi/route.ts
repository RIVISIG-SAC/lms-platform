import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, type SessionPayload } from "@/lib/auth";
import { chargeAndFulfill } from "@/lib/payments";
import { checkRateLimit } from "@/lib/security/rateLimit";
import { acquirePaymentLock, releasePaymentLock } from "@/lib/security/paymentLock";

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

  // Serializa los cobros del mismo usuario sobre el mismo recurso: evita el
  // doble cargo por doble clic o dos pestañas (ver paymentLock).
  const lockKey = `course:${session.userId}:${courseId}`;
  if (!(await acquirePaymentLock(lockKey))) {
    return NextResponse.json(
      { error: "Ya hay un pago en proceso. Espera unos segundos." },
      { status: 409 },
    );
  }

  try {
    return await chargeCourse(session, token, courseId);
  } finally {
    await releasePaymentLock(lockKey);
  }
}

async function chargeCourse(session: SessionPayload, token: string, courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || !course.published) {
    return NextResponse.json({ error: "Curso no disponible" }, { status: 404 });
  }
  if (course.isFree) {
    return NextResponse.json({ error: "Este curso es gratuito" }, { status: 400 });
  }

  // Verificar que no tenga una inscripción activa
  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.userId, courseId } },
  });
  if (existing && ["PAID", "COMPLETED"].includes(existing.status)) {
    return NextResponse.json({ error: "Ya estás inscrito en este curso" }, { status: 409 });
  }

  const outcome = await chargeAndFulfill({
    userId: session.userId,
    email: session.email,
    kind: "COURSE",
    courseId,
    amount: course.price,
    token,
    description: `Curso: ${course.title}`,
  });

  if (!outcome.ok) {
    return outcome.stage === "charge"
      ? NextResponse.json({ error: outcome.message }, { status: 402 })
      : NextResponse.json(
          {
            error: `Tu pago se registró (código ${outcome.chargeId}) pero no pudimos activar el curso. Escríbenos y lo activaremos de inmediato.`,
          },
          { status: 500 },
        );
  }

  return NextResponse.json({
    success: true,
    chargeId: outcome.chargeId,
    enrollmentId: outcome.result.fulfilled ? outcome.result.enrollmentId : null,
    courseId,
  });
}
