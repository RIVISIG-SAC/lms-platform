const CULQI_API = "https://api.culqi.com/v2";

type CulqiChargeParams = {
  amount: number; // en centavos (S/. 100.00 = 10000)
  currencyCode: string;
  email: string;
  sourceId: string; // token generado por Culqi.js
  description: string;
};

type CulqiChargeResponse = {
  id: string;
  object: string;
  amount: number;
  currency_code: string;
  outcome: {
    type: string;
    code: string;
    merchant_message: string;
    user_message: string;
  };
};

export async function createCharge(params: CulqiChargeParams): Promise<CulqiChargeResponse> {
  const res = await fetch(`${CULQI_API}/charges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CULQI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amount,
      currency_code: params.currencyCode,
      email: params.email,
      source_id: params.sourceId,
      description: params.description,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    const message = data?.user_message ?? data?.merchant_message ?? "Error al procesar el pago";
    throw new Error(message);
  }

  return data as CulqiChargeResponse;
}

export function toSoles(cents: number) {
  return cents / 100;
}

export function toCents(soles: number) {
  return Math.round(soles * 100);
}
