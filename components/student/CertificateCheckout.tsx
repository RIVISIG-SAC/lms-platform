"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RefundPolicyNotice } from "@/components/legal/RefundPolicyNotice";
import { useCulqiCheckout } from "@/components/payments/use-culqi-checkout";
import { PaymentStatusOverlay } from "@/components/payments/PaymentStatusOverlay";
import { CERTIFICATE_PAYMENT_COPY } from "@/components/payments/status-copy";

type Props = {
  enrollmentId: string;
  certificateFeeInSoles: number;
  customerEmail?: string;
};

export function CertificateCheckout({ enrollmentId, certificateFeeInSoles, customerEmail }: Props) {
  const router = useRouter();
  const onSuccess = useCallback(() => router.refresh(), [router]);
  const { ready, preparing, loading, error, open, payment, retry, dismiss, continueAfterSuccess } =
    useCulqiCheckout({
      endpoint: "/api/payments/certificate",
      onSuccess,
      customerEmail,
      // La página se queda (solo se refresca): hay que cerrar la pantalla.
      dismissOnSuccess: true,
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
        aria-busy={loading || preparing}
        className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed text-base"
      >
        {(loading || preparing) && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {loading
          ? "Procesando pago..."
          : preparing
            ? "Cargando pago..."
            : `Obtener certificado — S/. ${certificateFeeInSoles.toFixed(2)}`}
      </button>
      <p className="text-xs text-center text-muted-foreground">
        Pago seguro procesado por Culqi
      </p>
      <RefundPolicyNotice />
      <PaymentStatusOverlay
        state={payment}
        copy={CERTIFICATE_PAYMENT_COPY}
        onContinue={continueAfterSuccess}
        onRetry={retry}
        onDismiss={dismiss}
      />
    </div>
  );
}
