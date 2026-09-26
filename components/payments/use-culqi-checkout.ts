"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LEGAL_COMPANY } from "@/lib/legal/company";

// No usar "culqi-js": Culqi v4 monta su modal en `#culqi-js` y, si el <script>
// tiene ese id, el modal termina dentro del script y no se ve.
const CULQI_SCRIPT_ID = "culqi-checkout-script";
const CULQI_SCRIPT_SRC = "https://checkout.culqi.com/js/v4";

/** Tiempo que se muestra "¡Pago exitoso!" antes de continuar solo. */
const SUCCESS_CONTINUE_MS = 1600;

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
  /** Prellena el formulario del modal; Culqi ignora (y loguea) un email inválido. */
  client?: { email: string };
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

/**
 * - `processing`: el servidor está cobrando y activando.
 * - `success`: cobrado y entregado.
 * - `error`: rechazado; no se cobró, se puede reintentar.
 * - `uncertain`: no sabemos si se cobró (5xx o se cortó la conexión). No se
 *   ofrece reintentar para no provocar un segundo cargo.
 */
export type PaymentStatus = "idle" | "processing" | "success" | "error" | "uncertain";

export type PaymentState = { status: PaymentStatus; message?: string };

type Options = {
  endpoint: string;
  onSuccess: (data: unknown) => void;
  /** Correo de la sesión: evita que el comprador lo vuelva a escribir en el modal. */
  customerEmail?: string;
  /**
   * Cerrar la pantalla de estado después de `onSuccess`. Solo cuando la página
   * se queda (p. ej. `router.refresh()`); si `onSuccess` navega, se deja
   * abierta para que no se vea la página vieja durante la transición.
   */
  dismissOnSuccess?: boolean;
};

/**
 * Checkout de Culqi (tarjeta + Yape) compartido por todos los botones de pago.
 *
 * El cobro lo hace siempre el servidor con el precio de la BD: el monto que se
 * pasa aquí sólo se muestra en el modal.
 */
export function useCulqiCheckout({ endpoint, onSuccess, customerEmail, dismissOnSuccess = false }: Options) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentState>({ status: "idle" });
  const inFlight = useRef(false);
  const lastParams = useRef<OpenParams | null>(null);
  const successData = useRef<unknown>(null);
  const continueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadCulqiScript()
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setError("No se pudo cargar el sistema de pago. Recarga la página."));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      if (continueTimer.current) clearTimeout(continueTimer.current);
    },
    [],
  );

  /** Sale de la pantalla de éxito; lo llama el temporizador o el botón "Ir ahora". */
  const continueAfterSuccess = useCallback(() => {
    if (!continueTimer.current) return; // ya se ejecutó
    clearTimeout(continueTimer.current);
    continueTimer.current = null;
    onSuccess(successData.current);
    if (dismissOnSuccess) setPayment({ status: "idle" });
  }, [onSuccess, dismissOnSuccess]);

  // `window.culqi` se crea al abrir el modal y vive más que ese render: lee la
  // versión vigente de `continueAfterSuccess` por ref.
  const continueAfterSuccessRef = useRef(continueAfterSuccess);
  useEffect(() => {
    continueAfterSuccessRef.current = continueAfterSuccess;
  }, [continueAfterSuccess]);

  const dismiss = useCallback(() => setPayment({ status: "idle" }), []);

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
      setPayment({ status: "idle" });
      lastParams.current = { amountInSoles, body };

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
        setPayment({ status: "processing" });

        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, ...body }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok) {
            successData.current = data;
            setPayment({ status: "success" });
            continueTimer.current = setTimeout(
              () => continueAfterSuccessRef.current(),
              SUCCESS_CONTINUE_MS,
            );
          } else if (res.status >= 500) {
            // Un 500 puede venir después del cobro (p. ej. no se pudo activar).
            setPayment({ status: "uncertain", message: data.error });
          } else {
            setPayment({ status: "error", message: data.error ?? "No se pudo procesar el pago." });
          }
        } catch {
          setPayment({ status: "uncertain" });
        } finally {
          inFlight.current = false;
        }
      };

      Culqi.publicKey = publicKey;
      if (customerEmail) Culqi.client = { email: customerEmail };
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
    [endpoint, customerEmail],
  );

  /** Vuelve a abrir Culqi con el mismo monto tras un rechazo. */
  const retry = useCallback(() => {
    if (lastParams.current) open(lastParams.current);
  }, [open]);

  // Culqi.js tarda unos segundos en la primera visita: sin esto el botón se
  // ve deshabilitado sin explicación. Si la carga falla manda `error`.
  const preparing = !ready && !error;
  const loading = payment.status === "processing" || payment.status === "success";

  return {
    ready,
    preparing,
    loading,
    error,
    open,
    payment,
    retry,
    dismiss,
    continueAfterSuccess,
  };
}
