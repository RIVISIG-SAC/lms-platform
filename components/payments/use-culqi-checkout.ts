"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LEGAL_COMPANY } from "@/lib/legal/company";

const CULQI_SCRIPT_ID = "culqi-js";
const CULQI_SCRIPT_SRC = "https://checkout.culqi.com/js/v4";

type CulqiError = { user_message?: string; merchant_message?: string };

type CulqiInstance = {
  publicKey: string;
  settings: (config: { title: string; currency: string; amount: number }) => void;
  options: (config: {
    lang?: "auto" | "es" | "en";
    installments?: boolean;
    paymentMethods?: Partial<
      Record<"tarjeta" | "yape" | "billetera" | "bancaMovil" | "agente" | "cuotealo", boolean>
    >;
    style?: { logo?: string };
  }) => void;
  open: () => void;
  close: () => void;
  token?: { id: string; email: string } | null;
  error?: CulqiError | null;
};

declare global {
  interface Window {
    Culqi?: CulqiInstance;
    culqi?: () => void;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Carga Culqi.js una sola vez aunque haya varios botones de pago en la página. */
function loadCulqiScript(): Promise<void> {
  if (window.Culqi) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(CULQI_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      scriptPromise = null;
      script.remove();
      reject(new Error("No se pudo cargar Culqi"));
    });
    if (!existing) {
      script.id = CULQI_SCRIPT_ID;
      script.src = CULQI_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return scriptPromise;
}

type OpenParams = {
  amountInSoles: number;
  /** Se envía al endpoint junto con el token. */
  body: Record<string, string>;
};

type Options = {
  endpoint: string;
  onSuccess: (data: unknown) => void;
};

/**
 * Checkout de Culqi (tarjeta + Yape) compartido por todos los botones de pago.
 *
 * El cobro lo hace siempre el servidor con el precio de la BD: el monto que se
 * pasa aquí sólo se muestra en el modal.
 */
export function useCulqiCheckout({ endpoint, onSuccess }: Options) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadCulqiScript()
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setError("No se pudo cargar el sistema de pago. Recarga la página."));
    return () => {
      cancelled = true;
    };
  }, []);

  const open = useCallback(
    ({ amountInSoles, body }: OpenParams) => {
      const Culqi = window.Culqi;
      const publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
      // Un placeholder como "pk_test_..." abre el modal pero Culqi responde 401.
      if (!publicKey || !/^pk_(test|live)_[A-Za-z0-9]{8,}$/.test(publicKey)) {
        console.error("[culqi] NEXT_PUBLIC_CULQI_PUBLIC_KEY no es una llave válida");
        setError("Los pagos no están configurados. Contáctanos para completar tu compra.");
        return;
      }
      if (!Culqi) {
        setError("El sistema de pago no está listo. Recarga la página.");
        return;
      }
      setError(null);

      // `window.culqi` es global: se reasigna al abrir para que responda el
      // botón que el usuario pulsó (en la landing hay dos BuyButton).
      window.culqi = async () => {
        if (Culqi.error) {
          setError(Culqi.error.user_message ?? "No se pudo validar la tarjeta.");
          Culqi.error = null;
          return;
        }
        const token = Culqi.token?.id;
        if (!token || inFlight.current) return;
        inFlight.current = true;
        Culqi.close();
        setLoading(true);

        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, ...body }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data.error ?? "Error al procesar el pago");
            return;
          }
          onSuccess(data);
        } catch {
          setError("Error de conexión. Antes de reintentar revisa \"Mis cursos\": el cobro pudo haberse realizado.");
        } finally {
          setLoading(false);
          inFlight.current = false;
        }
      };

      Culqi.publicKey = publicKey;
      // El nombre del comercio en el modal debe coincidir con la marca que
      // Culqi valida (la misma del sitio y de los documentos legales).
      Culqi.settings({
        title: LEGAL_COMPANY.marca,
        currency: "PEN",
        amount: Math.round(amountInSoles * 100),
      });
      // Sólo métodos que se cobran con token. Banca móvil, agentes, billeteras
      // y Cuotéalo requieren crear una "orden" en Culqi, que no implementamos.
      Culqi.options({
        lang: "es",
        installments: false,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          billetera: false,
          bancaMovil: false,
          agente: false,
          cuotealo: false,
        },
      });
      Culqi.open();
    },
    [endpoint, onSuccess],
  );

  return { ready, loading, error, open };
}
