"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { createRefund, toCents, type CulqiRefundReason } from "@/lib/culqi";
import { fulfillPayment } from "@/lib/payments";
import { acquirePaymentLock, releasePaymentLock } from "@/lib/security/paymentLock";

type ActionResult = { error?: string; success?: boolean };

const REFUND_REASONS: CulqiRefundReason[] = ["solicitud_comprador", "duplicidad", "fraudulento"];

async function assertAdmin(): Promise<boolean> {
  try {
    const session = await getRequiredSession();
    return session.role === "ADMIN";
  } catch {
    return false;
  }
}

/** Reintenta entregar un pago cobrado cuyo acceso/certificado no se activó. */
export async function retryPaymentFulfillment(paymentId: string): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "No autorizado" };

  try {
    const result = await fulfillPayment(paymentId);
    if (!result.fulfilled) {
      return {
        error:
          result.reason === "ALREADY_FULFILLED"
            ? "Este pago ya fue entregado."
            : "Solo se pueden entregar pagos cobrados.",
      };
    }
  } catch (err) {
    console.error("[admin/payments] reintento de entrega falló", { paymentId, err });
    return { error: "No se pudo completar la entrega. Revisa los logs." };
  }

  revalidatePath("/admin/payments");
  return { success: true };
}

/**
 * Reembolsa el total de un pago en Culqi. Opcionalmente retira lo entregado:
 * el acceso al curso (la inscripción pasa a EXPIRED) o el certificado (REVOKED).
 */
export async function refundPayment(_prev: unknown, formData: FormData): Promise<ActionResult> {
  if (!(await assertAdmin())) return { error: "No autorizado" };

  const paymentId = String(formData.get("paymentId") ?? "");
  const reason = String(formData.get("reason") ?? "") as CulqiRefundReason;
  const revokeAccess = formData.get("revokeAccess") === "on";

  if (!paymentId) return { error: "Pago no indicado" };
  if (!REFUND_REASONS.includes(reason)) return { error: "Motivo de reembolso inválido" };

  const lockKey = `refund:${paymentId}`;
  if (!(await acquirePaymentLock(lockKey))) {
    return { error: "Ya hay un reembolso en proceso para este pago." };
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { enrollment: { include: { certificate: true } } },
    });
    if (!payment) return { error: "Pago no encontrado" };
    if (payment.status !== "PAID" || !payment.culqiChargeId) {
      return { error: "Solo se pueden reembolsar pagos cobrados." };
    }

    try {
      await createRefund({
        chargeId: payment.culqiChargeId,
        amount: toCents(Number(payment.amount)),
        reason,
      });
    } catch (err) {
      return { error: err instanceof Error ? err.message : "Culqi rechazó el reembolso" };
    }

    // Culqi ya devolvió el dinero: desde aquí sólo se refleja en la BD.
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED", refundedAt: new Date() },
    });

    if (revokeAccess && payment.enrollment) {
      if (payment.kind === "COURSE") {
        await prisma.enrollment.update({
          where: { id: payment.enrollment.id },
          data: { status: "EXPIRED", endDate: new Date() },
        });
      } else if (payment.enrollment.certificate) {
        await prisma.certificate.update({
          where: { id: payment.enrollment.certificate.id },
          data: { status: "REVOKED" },
        });
      }
    }
  } finally {
    await releasePaymentLock(lockKey);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/students");
  revalidatePath("/admin/certificates");
  return { success: true };
}
