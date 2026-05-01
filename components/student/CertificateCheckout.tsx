"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Culqi?: {
      publicKey: string;
      settings: (config: {
        title: string;
        currency: string;
        description: string;
        amount: number;
      }) => void;
      open: () => void;
      close: () => void;
      token?: { id: string; email: string };
    };
    culqi?: () => void;
  }
}

type Props = {
  enrollmentId: string;
  courseTitle: string;
  certificateFeeInSoles: number;
};

export function CertificateCheckout({ enrollmentId, courseTitle, certificateFeeInSoles }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const callbackRef = useRef(false);

  useEffect(() => {
    if (document.getElementById("culqi-js")) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "culqi-js";
    script.src = "https://checkout.culqi.com/js/v4";
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptReady || !window.Culqi) return;

    window.culqi = async () => {
      if (!window.Culqi?.token || callbackRef.current) return;
      callbackRef.current = true;

      const token = window.Culqi.token.id;
      window.Culqi.close();
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/payments/certificate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, enrollmentId }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Error al procesar el pago");
        } else {
          router.refresh();
        }
      } catch {
        setError("Error de conexión. Intenta nuevamente.");
      } finally {
        setLoading(false);
        callbackRef.current = false;
      }
    };
  }, [scriptReady, enrollmentId, router]);

  function handlePay() {
    if (!scriptReady || !window.Culqi) {
      setError("El sistema de pago no está listo. Recarga la página.");
      return;
    }

    window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY!;
    window.Culqi.settings({
      title: "Cursos Pro",
      currency: "PEN",
      description: `Certificado: ${courseTitle}`,
      amount: Math.round(certificateFeeInSoles * 100),
    });
    window.Culqi.open();
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
          {error}
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={loading || !scriptReady}
        className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed text-base"
      >
        {loading
          ? "Procesando pago..."
          : `Obtener certificado — S/. ${certificateFeeInSoles.toFixed(2)}`}
      </button>
      <p className="text-xs text-center text-muted-foreground">
        Pago seguro procesado por Culqi
      </p>
    </div>
  );
}
