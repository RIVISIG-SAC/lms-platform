"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefundPolicyNotice } from "@/components/legal/RefundPolicyNotice";
import { useCulqiCheckout } from "@/components/payments/use-culqi-checkout";
import { PaymentStatusOverlay } from "@/components/payments/PaymentStatusOverlay";
import { coursePaymentCopy } from "@/components/payments/status-copy";
import { PURCHASE_INTENT_PARAM } from "@/lib/navigation/next-path";
import { cn } from "@/lib/utils";

type Props = {
  courseId: string;
  price: number | string | { toNumber(): number };
  courseTitle?: string;
  customerEmail?: string;
  /**
   * Abrir el checkout en cuanto Culqi esté listo: el visitante volvió al curso
   * tras registrarse para comprarlo. Solo un botón por página debe tenerlo.
   */
  autoOpen?: boolean;
  /**
   * Botón al ancho de su texto y sin el aviso de reembolsos, para barras
   * estrechas. Quien lo use debe mostrar `RefundPolicyNotice` a la vista.
   */
  compact?: boolean;
};

export function BuyButton({
  courseId,
  price,
  courseTitle,
  customerEmail,
  autoOpen = false,
  compact = false,
}: Props) {
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

  const numericPrice =
    typeof price === "object" && "toNumber" in price
      ? price.toNumber()
      : Number(price);

  const handleBuy = useCallback(() => {
    // Así la redirección tras "¡Pago exitoso!" es inmediata.
    router.prefetch(courseHref);
    open({ amountInSoles: numericPrice, body: { courseId } });
  }, [router, courseHref, open, numericPrice, courseId]);

  const autoOpened = useRef(false);
  useEffect(() => {
    if (!autoOpen || !ready || autoOpened.current) return;
    autoOpened.current = true;
    // Se quita la marca para que recargar o volver atrás no reabra el pago.
    const url = new URL(window.location.href);
    url.searchParams.delete(PURCHASE_INTENT_PARAM);
    window.history.replaceState(window.history.state, "", url);
    handleBuy();
  }, [autoOpen, ready, handleBuy]);

  return (
    <div className="space-y-2">
      <Button
        onClick={handleBuy}
        disabled={loading || !ready}
        aria-busy={loading || preparing}
        className={cn(
          "font-semibold",
          compact ? "h-10 px-4 text-sm" : "w-full h-11 text-base",
        )}
      >
        {(loading || preparing) && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {loading ? "Procesando..." : preparing ? "Cargando pago..." : "Comprar ahora"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive text-center">
          {error}
        </p>
      )}
      {!compact && <RefundPolicyNotice />}
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
