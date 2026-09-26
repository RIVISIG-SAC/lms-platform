import type { PaymentKind, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCharge, toCents } from "@/lib/culqi";
import { addDays } from "@/lib/utils";
import {
  ENROLLMENT_ACCESS_DAYS,
  REENROLLABLE_STATUSES,
  resetEnrollmentProgress,
} from "@/lib/enrollments";
import { notifyCertificateIssued, notifyPaymentReceived } from "@/lib/notifications";

/**
 * Marca un pago como cobrado. Idempotente: si ya estaba PAID (o REFUNDED) no
 * hace nada, así la ruta de pago y el webhook pueden llegar en cualquier orden.
 */
export async function markPaymentPaid(paymentId: string, chargeId: string) {
  await prisma.payment.updateMany({
    where: { id: paymentId, status: { in: ["PENDING", "FAILED"] } },
    data: { status: "PAID", culqiChargeId: chargeId, paidAt: new Date(), failureMessage: null },
  });
}

export async function markPaymentFailed(paymentId: string, message: string) {
  await prisma.payment.updateMany({
    where: { id: paymentId, status: "PENDING" },
    data: { status: "FAILED", failureMessage: message.slice(0, 500) },
  });
}

export type FulfillResult =
  | { fulfilled: true; enrollmentId: string | null; verificationCode?: string }
  | { fulfilled: false; reason: "ALREADY_FULFILLED" | "NOT_PAID" };

/**
 * Entrega lo comprado (acceso al curso o certificado) una sola vez.
 *
 * `fulfilledAt` actúa de candado: se reclama con un update condicional antes
 * de tocar nada, de modo que si el webhook reintenta días después NO reinicia
 * el progreso del alumno. Si la entrega falla se libera para reintentarla.
 */
export async function fulfillPayment(paymentId: string): Promise<FulfillResult> {
  const claim = await prisma.payment.updateMany({
    where: { id: paymentId, status: "PAID", fulfilledAt: null },
    data: { fulfilledAt: new Date() },
  });

  if (claim.count === 0) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { status: true },
    });
    return {
      fulfilled: false,
      reason: payment?.status === "PAID" ? "ALREADY_FULFILLED" : "NOT_PAID",
    };
  }

  try {
    const payment = await prisma.payment.findUniqueOrThrow({
      where: { id: paymentId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    return payment.kind === "COURSE"
      ? await fulfillCourse(payment)
      : await fulfillCertificate(payment);
  } catch (err) {
    await prisma.payment
      .update({ where: { id: paymentId }, data: { fulfilledAt: null } })
      .catch(() => {});
    throw err;
  }
}

type LoadedPayment = {
  id: string;
  amount: Prisma.Decimal;
  enrollmentId: string | null;
  user: { id: string; name: string; email: string };
  course: { id: string; title: string };
};

async function fulfillCourse(payment: LoadedPayment): Promise<FulfillResult> {
  const { user, course } = payment;

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });

  if (existing && REENROLLABLE_STATUSES.includes(existing.status as never)) {
    await resetEnrollmentProgress(existing.id);
  }

  const startDate = new Date();
  const endDate = addDays(startDate, ENROLLMENT_ACCESS_DAYS);

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    create: { userId: user.id, courseId: course.id, status: "PAID", startDate, endDate },
    update: { status: "PAID", startDate, endDate, progressPercentage: 0 },
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { enrollmentId: enrollment.id },
  });

  await notifyPaymentReceived({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    amount: Number(payment.amount),
    kind: "course",
    resourceTitle: course.title,
    resourceLink: `/student/courses/${course.id}`,
    notifyAdminsAlso: true,
  });

  return { fulfilled: true, enrollmentId: enrollment.id };
}

async function fulfillCertificate(payment: LoadedPayment): Promise<FulfillResult> {
  const { user, course } = payment;
  if (!payment.enrollmentId) throw new Error(`Pago ${payment.id} sin inscripción asociada`);

  const certificate = await prisma.certificate.findUnique({
    where: { enrollmentId: payment.enrollmentId },
  });
  if (!certificate) throw new Error(`Pago ${payment.id}: la inscripción no tiene certificado`);

  const activated = await prisma.certificate.updateMany({
    where: { id: certificate.id, status: "PENDING_PAYMENT" },
    data: { status: "ACTIVE", certificatePaidAt: new Date() },
  });

  await notifyPaymentReceived({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    amount: Number(payment.amount),
    kind: "certificate",
    resourceTitle: course.title,
    resourceLink: "/student/certificates",
    notifyAdminsAlso: true,
  });

  if (activated.count > 0) {
    await notifyCertificateIssued({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      courseTitle: course.title,
      verificationCode: certificate.verificationCode,
      notifyAdminsAlso: true,
    });
  }

  return {
    fulfilled: true,
    enrollmentId: payment.enrollmentId,
    verificationCode: certificate.verificationCode,
  };
}

export type ChargeOutcome =
  | { ok: true; paymentId: string; chargeId: string; result: FulfillResult }
  | { ok: false; stage: "charge"; message: string }
  | { ok: false; stage: "fulfill"; paymentId: string; chargeId: string };

/**
 * Flujo completo de un cobro: registra el intento, cobra en Culqi con el monto
 * de la BD y entrega lo comprado. El `paymentId` viaja en la metadata del cargo
 * para que el webhook pueda completar la entrega si este proceso muere.
 */
export async function chargeAndFulfill(input: {
  userId: string;
  email: string;
  kind: PaymentKind;
  courseId: string;
  enrollmentId?: string;
  amount: Prisma.Decimal;
  token: string;
  description: string;
}): Promise<ChargeOutcome> {
  const payment = await prisma.payment.create({
    data: {
      userId: input.userId,
      kind: input.kind,
      courseId: input.courseId,
      enrollmentId: input.enrollmentId ?? null,
      amount: input.amount,
    },
  });

  let chargeId: string;
  try {
    const charge = await createCharge({
      amount: toCents(Number(input.amount)),
      currencyCode: "PEN",
      email: input.email,
      sourceId: input.token,
      description: input.description,
      metadata: { paymentId: payment.id, kind: input.kind, userId: input.userId },
    });
    chargeId = charge.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al procesar el pago";
    await markPaymentFailed(payment.id, message);
    return { ok: false, stage: "charge", message };
  }

  // El cobro ya se hizo: si algo falla desde aquí, el Payment queda PAID sin
  // `fulfilledAt` y el webhook (o un admin) puede completar la entrega.
  try {
    await markPaymentPaid(payment.id, chargeId);
    const result = await fulfillPayment(payment.id);
    return { ok: true, paymentId: payment.id, chargeId, result };
  } catch (err) {
    console.error("[payments] cobro sin entrega", { paymentId: payment.id, chargeId, err });
    return { ok: false, stage: "fulfill", paymentId: payment.id, chargeId };
  }
}
