const CULQI_API = "https://api.culqi.com/v2";

type CulqiChargeParams = {
  amount: number; // en centavos (S/. 100.00 = 10000)
  currencyCode: string;
  email: string;
  sourceId: string; // token generado por Culqi.js
  description: string;
  metadata?: Record<string, string>;
};

type CulqiChargeResponse = {
  id: string;
  object: "charge";
  amount: number;
  currency_code: string;
  outcome: {
    type: string;
    code: string;
    merchant_message: string;
    user_message: string;
  };
};

/** Culqi limita la descripción del cargo a 80 caracteres. */
const MAX_DESCRIPTION_LENGTH = 80;

export async function createCharge(params: CulqiChargeParams): Promise<CulqiChargeResponse> {
  const secretKey = process.env.CULQI_SECRET_KEY;
  if (!secretKey) throw new Error("El sistema de pagos no está configurado");

  const res = await fetch(`${CULQI_API}/charges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency_code: params.currencyCode,
      email: params.email,
      source_id: params.sourceId,
      description: params.description.slice(0, MAX_DESCRIPTION_LENGTH),
      metadata: params.metadata,
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.user_message ?? data?.merchant_message ?? "Error al procesar el pago";
    throw new Error(message);
  }

  // Un 200 con `action_code: "REVIEW"` significa que Culqi pide autenticación
  // 3DS: el cargo NO se hizo. Sólo un objeto `charge` confirma el cobro, así
  // que cualquier otra respuesta se trata como rechazo para no dar acceso gratis.
  if (data?.object !== "charge" || !data.id) {
    if (data?.action_code === "REVIEW") {
      throw new Error(
        "Tu banco requiere una verificación adicional (3D Secure) que aún no soportamos. Intenta con otra tarjeta o paga con Yape.",
      );
    }
    throw new Error(data?.user_message ?? "No se pudo confirmar el pago");
  }

  return data as CulqiChargeResponse;
}

export type CulqiCharge = CulqiChargeResponse & {
  metadata?: Record<string, string> | null;
};

export type CulqiRefund = {
  id: string;
  object: "refund";
  charge_id: string;
  amount: number;
};

/** Lee un recurso directamente de Culqi (fuente de verdad para el webhook). */
async function getResource<T>(path: string): Promise<T> {
  const secretKey = process.env.CULQI_SECRET_KEY;
  if (!secretKey) throw new Error("El sistema de pagos no está configurado");

  const res = await fetch(`${CULQI_API}${path}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Culqi GET ${path} respondió ${res.status}`);
  return (await res.json()) as T;
}

export function getCharge(chargeId: string) {
  return getResource<CulqiCharge>(`/charges/${encodeURIComponent(chargeId)}`);
}

export function getRefund(refundId: string) {
  return getResource<CulqiRefund>(`/refunds/${encodeURIComponent(refundId)}`);
}

export type CulqiRefundReason = "duplicidad" | "fraudulento" | "solicitud_comprador";

/** Devuelve (total o parcialmente) un cargo. `amount` en centavos. */
export async function createRefund(params: {
  chargeId: string;
  amount: number;
  reason: CulqiRefundReason;
}): Promise<CulqiRefund> {
  const secretKey = process.env.CULQI_SECRET_KEY;
  if (!secretKey) throw new Error("El sistema de pagos no está configurado");

  const res = await fetch(`${CULQI_API}/refunds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      charge_id: params.chargeId,
      reason: params.reason,
    }),
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || data?.object !== "refund") {
    throw new Error(data?.merchant_message ?? data?.user_message ?? "Culqi rechazó el reembolso");
  }
  return data as CulqiRefund;
}

export function toSoles(cents: number) {
  return cents / 100;
}

export function toCents(soles: number) {
  return Math.round(soles * 100);
}
