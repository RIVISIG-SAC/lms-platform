import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCharge, getRefund, toCents } from "@/lib/culqi";
import { fulfillPayment, markPaymentPaid } from "@/lib/payments";
import { notifyAdmins } from "@/lib/notifications";

/**
 * Webhook de Culqi: red de seguridad para cobros cuya entrega no terminó en la
 * ruta de pago (timeout, caída entre el cobro y la BD) y para registrar
 * reembolsos hechos desde CulqiPanel.
 *
 * Culqi no firma los webhooks: se autentica con HTTP Basic (activar
 * "autenticación" al crear el webhook en el panel) y, como el payload sólo es
 * una pista, cada recurso se vuelve a leer desde la API antes de actuar.
 */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let event: { type?: string; data?: unknown };
  try {
    event = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const type = event.type ?? "";
  const resourceId = extractId(event.data);
  if (!resourceId) return NextResponse.json({ received: true, ignored: true });

  try {
    if (type.startsWith("charge.")) await handleCharge(resourceId);
    else if (type.startsWith("refund.")) await handleRefund(resourceId);
  } catch (err) {
    // 5xx para que Culqi reintente.
    console.error("[webhooks/culqi] error procesando", { type, resourceId, err });
    return NextResponse.json({ error: "Error procesando el evento" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCharge(chargeId: string) {
  const charge = await getCharge(chargeId);
  if (charge.outcome?.type !== "venta_exitosa") return;

  const payment = await prisma.payment.findFirst({
    where: {
      OR: [{ culqiChargeId: charge.id }, { id: charge.metadata?.paymentId ?? "" }],
    },
  });
  if (!payment) {
    console.warn("[webhooks/culqi] cargo sin Payment asociado", { chargeId: charge.id });
    return;
  }

  if (charge.amount !== toCents(Number(payment.amount)) || charge.currency_code !== payment.currency) {
    console.error("[webhooks/culqi] el monto no coincide, no se entrega", {
      paymentId: payment.id,
      chargeId: charge.id,
      charged: charge.amount,
      expected: toCents(Number(payment.amount)),
    });
    return;
  }

  await markPaymentPaid(payment.id, charge.id);
  const result = await fulfillPayment(payment.id);
  if (result.fulfilled) {
    console.info("[webhooks/culqi] entrega completada por webhook", { paymentId: payment.id });
  }
}

async function handleRefund(refundId: string) {
  const refund = await getRefund(refundId);
  const payment = await prisma.payment.findUnique({
    where: { culqiChargeId: refund.charge_id },
    include: { user: { select: { name: true } }, course: { select: { title: true } } },
  });
  if (!payment || payment.status === "REFUNDED") return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "REFUNDED", refundedAt: new Date() },
  });

  // El acceso no se revoca solo: el reembolso puede ser parcial o una
  // excepción comercial, así que la decisión queda en manos del admin.
  await notifyAdmins({
    type: "ADMIN_NEW_PAYMENT",
    title: "Reembolso registrado",
    message: `Se reembolsó el pago de ${payment.user.name} por ${payment.course.title}. Revisa si corresponde retirar el acceso.`,
    link: "/admin/payments",
  });
}

/** `data` llega a veces como objeto y a veces como JSON serializado. */
function extractId(data: unknown): string | null {
  let value = data;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  const id = (value as { id?: unknown } | null)?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

function isAuthorized(header: string | null): boolean {
  const user = process.env.CULQI_WEBHOOK_USER;
  const password = process.env.CULQI_WEBHOOK_PASSWORD;
  // Sin credenciales configuradas el endpoint queda cerrado.
  if (!user || !password || !header?.startsWith("Basic ")) return false;

  const expected = `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
  const digest = (v: string) => createHash("sha256").update(v).digest();
  return timingSafeEqual(digest(header), digest(expected));
}
