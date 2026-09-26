"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RefundPolicyNotice } from "@/components/legal/RefundPolicyNotice";
import { useCulqiCheckout } from "@/components/payments/use-culqi-checkout";
import { PaymentStatusOverlay } from "@/components/payments/PaymentStatusOverlay";
import { coursePaymentCopy } from "@/components/payments/status-copy";

type Props = {
  courseId: string;
  priceInSoles: number;
  courseTitle?: string;
  customerEmail?: string;
};

export function CulqiCheckout({ courseId, priceInSoles, courseTitle, customerEmail }: Props) {
  const router = useRouter();
  const courseHref = `/student/courses/${courseId}?enrolled=1`;
  const onSuccess = useCallback(() => router.push(courseHref), [router, courseHref]);
  const { ready, preparing, loading, error, open, payment, retry, dismiss, continueAfterSuccess } =
    useCulqiCheckout({
      endpoint: "/api/payments/culqi",
      onSuccess,
      customerEmail,
    });
  const copy = useMemo(() => coursePaymentCopy(courseTitle), [courseTitle]);

  function handlePay() {
    // Así la redirección tras "¡Pago exitoso!" es inmediata.
    router.prefetch(courseHref);
    open({ amountInSoles: priceInSoles, body: { courseId } });
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
            : `Comprar — S/. ${priceInSoles.toFixed(2)}`}
      </button>
      <p className="text-xs text-center text-muted-foreground">
        Pago seguro procesado por Culqi · Acceso por 180 días
      </p>
      <RefundPolicyNotice />
      <PaymentStatusOverlay
        state={payment}
        copy={copy}
        onContinue={continueAfterSuccess}
        onRetry={retry}
        onDismiss={dismiss}
      />
    </div>
  );
}
