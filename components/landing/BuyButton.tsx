"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefundPolicyNotice } from "@/components/legal/RefundPolicyNotice";
import { useCulqiCheckout } from "@/components/payments/use-culqi-checkout";

type Props = {
  courseId: string;
  price: number | string | { toNumber(): number };
};

export function BuyButton({ courseId, price }: Props) {
  const router = useRouter();
  const onSuccess = useCallback(
    () => router.push(`/student/courses/${courseId}?enrolled=1`),
    [router, courseId],
  );
  const { ready, loading, error, open } = useCulqiCheckout({
    endpoint: "/api/payments/culqi",
    onSuccess,
  });

  const numericPrice =
    typeof price === "object" && "toNumber" in price
      ? price.toNumber()
      : Number(price);

  function handleBuy() {
    open({ amountInSoles: numericPrice, body: { courseId } });
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleBuy}
        disabled={loading || !ready}
        className="w-full h-11 text-base font-semibold"
      >
        {loading ? "Procesando..." : "Comprar ahora"}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive text-center">
          {error}
        </p>
      )}
      <RefundPolicyNotice />
    </div>
  );
}
