"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Culqi.js se carga como script externo (ver layout o Script component)
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
  courseId: string;
  courseTitle: string;
  priceInSoles: number;
};

export function CulqiCheckout({ courseId, courseTitle, priceInSoles }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const callbackRef = useRef(false);

  useEffect(() => {
    // Cargar Culqi.js dinámicamente
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

    // Culqi llama a window.culqi() cuando el usuario termina con el formulario
    window.culqi = async () => {
      if (!window.Culqi?.token || callbackRef.current) return;
      callbackRef.current = true;

      const token = window.Culqi.token.id;
      window.Culqi.close();
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/payments/culqi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, courseId }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Error al procesar el pago");
        } else {
          router.push(`/student/courses/${courseId}?enrolled=1`);
        }
      } catch {
        setError("Error de conexión. Intenta nuevamente.");
      } finally {
        setLoading(false);
        callbackRef.current = false;
      }
    };
  }, [scriptReady, courseId, router]);

  function handlePay() {
    if (!scriptReady || !window.Culqi) {
      setError("El sistema de pago no está listo. Recarga la página.");
      return;
    }

    window.Culqi.publicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY!;
    window.Culqi.settings({
      title: "Cursos Pro",
      currency: "PEN",
      description: courseTitle,
      amount: Math.round(priceInSoles * 100),
    });
    window.Culqi.open();
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-[var(--destructive)] bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {error}
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={loading || !scriptReady}
        className="w-full bg-[var(--primary)] text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed text-base"
      >
        {loading ? "Procesando pago..." : `Comprar — S/. ${priceInSoles.toFixed(2)}`}
      </button>
      <p className="text-xs text-center text-[var(--muted-foreground)]">
        Pago seguro procesado por Culqi · Acceso por 180 días
      </p>
    </div>
  );
}
