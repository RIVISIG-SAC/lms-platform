import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createCharge, toCents } from "@/lib/culqi";
import { checkRateLimit } from "@/lib/security/rateLimit";

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

  try {
    await createCharge({
      amount: toCents(Number(enrollment.course.certificateFee)),
      currencyCode: "PEN",
      email: session.email,
      sourceId: token,
      description: `Certificado: ${enrollment.course.title}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al procesar el pago";
    return NextResponse.json({ error: message }, { status: 402 });
  }

  const updated = await prisma.certificate.update({
    where: { id: enrollment.certificate.id },
    data: { status: "ACTIVE", certificatePaidAt: new Date() },
  });

  return NextResponse.json({
    success: true,
    verificationCode: updated.verificationCode,
  });
}
