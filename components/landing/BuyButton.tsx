"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  courseId: string;
  price: number | string | { toNumber(): number };
};

export function BuyButton({ courseId, price }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericPrice =
    typeof price === "object" && "toNumber" in price
      ? price.toNumber()
      : Number(price);

  function handleBuy() {
    setError(null);

    const culqi = (window as unknown as { Culqi?: { publicKey: string; settings: (c: { title: string; currency: string; description: string; amount: number }) => void; open: () => void; close: () => void; token?: { id: string } }; culqi?: () => void }).Culqi;

    if (!culqi) {
      setError("El procesador de pagos no está disponible. Recarga la página.");
      return;
    }

    const CULQI_PUBLIC_KEY = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY ?? "";
    culqi.publicKey = CULQI_PUBLIC_KEY;
    culqi.settings({
      title: "Cursos Pro",
      currency: "PEN",
      description: "Acceso al curso (180 días)",
      amount: Math.round(numericPrice * 100),
    });

    (window as unknown as { culqi?: () => void }).culqi = async function () {
      const token = culqi.token?.id;
      if (!token) {
        setError("No se pudo obtener el token de pago.");
        culqi.close();
        return;
      }
      culqi.close();

      setLoading(true);
      try {
        const res = await fetch("/api/payments/culqi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, courseId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error al procesar el pago");
        router.push(`/student/courses/${courseId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        setLoading(false);
      }
    };

    culqi.open();
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleBuy}
        disabled={loading}
        className="w-full h-11 text-base font-semibold"
      >
        {loading ? "Procesando..." : "Comprar ahora"}
      </Button>
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
      <script src="https://checkout.culqi.com/js/v4" async />
    </div>
  );
}
