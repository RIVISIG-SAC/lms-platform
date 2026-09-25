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

  const rl = checkRateLimit(session.userId, "payment:certificate");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiados intentos. Reintenta en ${rl.retryInSeconds}s.` },
      { status: 429 },
    );
  }

  let body: { token: string; enrollmentId: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { token, enrollmentId } = body;
  if (!token || !enrollmentId) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // Serializa los cobros del mismo usuario sobre el mismo recurso: evita el
  // doble cargo por doble clic o dos pestañas (ver paymentLock).
  const lockKey = `certificate:${session.userId}:${enrollmentId}`;
  if (!(await acquirePaymentLock(lockKey))) {
    return NextResponse.json(
      { error: "Ya hay un pago en proceso. Espera unos segundos." },
      { status: 409 },
    );
  }

  try {
    return await chargeCertificate(session, token, enrollmentId);
  } finally {
    await releasePaymentLock(lockKey);
  }
}

async function chargeCertificate(session: SessionPayload, token: string, enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: { select: { isFree: true, certificateFee: true, title: true } },
      certificate: true,
    },
  });

  if (!enrollment || enrollment.userId !== session.userId) {
    return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });
  }

  if (!enrollment.course.isFree) {
    return NextResponse.json({ error: "Este curso no es gratuito" }, { status: 400 });
  }

  if (!enrollment.certificate || enrollment.certificate.status !== "PENDING_PAYMENT") {
    return NextResponse.json({ error: "No hay certificado pendiente de pago" }, { status: 400 });
  }

  if (!enrollment.course.certificateFee) {
    return NextResponse.json({ error: "El costo del certificado no está configurado" }, { status: 400 });
  }

  const outcome = await chargeAndFulfill({
    userId: session.userId,
    email: session.email,
    kind: "CERTIFICATE",
    courseId: enrollment.courseId,
    enrollmentId,
    amount: enrollment.course.certificateFee,
    token,
    description: `Certificado: ${enrollment.course.title}`,
  });

  if (!outcome.ok) {
    return outcome.stage === "charge"
      ? NextResponse.json({ error: outcome.message }, { status: 402 })
      : NextResponse.json(
          {
            error: `Tu pago se registró (código ${outcome.chargeId}) pero no pudimos emitir el certificado. Escríbenos y lo resolveremos de inmediato.`,
          },
          { status: 500 },
        );
  }

  return NextResponse.json({
    success: true,
    verificationCode: outcome.result.fulfilled
      ? outcome.result.verificationCode
      : enrollment.certificate.verificationCode,
  });
}
