"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefundPolicyNotice } from "@/components/legal/RefundPolicyNotice";
import { useCulqiCheckout } from "@/components/payments/use-culqi-checkout";

type Props = {
  enrollmentId: string;
  certificateFeeInSoles: number;
};

export function CertificateCheckout({ enrollmentId, certificateFeeInSoles }: Props) {
  const router = useRouter();
  const onSuccess = useCallback(() => router.refresh(), [router]);
  const { ready, loading, error, open } = useCulqiCheckout({
    endpoint: "/api/payments/certificate",
    onSuccess,
  });

  function handlePay() {
    open({
      amountInSoles: certificateFeeInSoles,
      body: { enrollmentId },
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <p
          role="alert"
          className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md"
        >
          {error}
        </p>
      )}
      <button
        onClick={handlePay}
        disabled={loading || !ready}
        className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed text-base"
      >
        {loading
          ? "Procesando pago..."
          : `Obtener certificado — S/. ${certificateFeeInSoles.toFixed(2)}`}
      </button>
      <p className="text-xs text-center text-muted-foreground">
        Pago seguro procesado por Culqi
      </p>
      <RefundPolicyNotice />
    </div>
  );
}
