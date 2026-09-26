"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PaymentState } from "@/components/payments/use-culqi-checkout";

/** A partir de aquí el cobro ya pasó casi siempre y el servidor está activando. */
const SLOW_PHASE_MS = 2500;

export type PaymentStatusCopy = {
  /** [al empezar, pasados unos segundos] */
  processing: readonly [string, string];
  successTitle: string;
  successDescription: string;
  continueLabel: string;
  /** Dónde comprobar si el cobro entró cuando el resultado es incierto. */
  uncertainHref: string;
  uncertainLabel: string;
};

type Props = {
  state: PaymentState;
  copy: PaymentStatusCopy;
  onContinue: () => void;
  onRetry: () => void;
  onDismiss: () => void;
};

/**
 * Pantalla centrada que cubre la página mientras se cobra y muestra el
 * resultado. Mientras procesa no se puede cerrar: además de dar contexto,
 * impide pulsar otro botón de compra de la misma página.
 */
export function PaymentStatusOverlay({ state, copy, onContinue, onRetry, onDismiss }: Props) {
  // Al cerrar, el diálogo anima la salida con el último contenido visible en
  // vez de quedarse vacío durante la animación.
  const [shown, setShown] = useState(state);
  if (state.status !== "idle" && state !== shown) setShown(state);

  const open = state.status !== "idle";
  const dismissible = state.status === "error" || state.status === "uncertain";

  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChange={(next) => {
        if (!next && dismissible) onDismiss();
      }}
    >
      <DialogContent showCloseButton={false} className="gap-0 p-8 text-center sm:max-w-sm">
        {shown.status === "processing" && <ProcessingView copy={copy} />}
        {shown.status === "success" && <SuccessView copy={copy} onContinue={onContinue} />}
        {shown.status === "error" && (
          <ErrorView message={shown.message} onRetry={onRetry} onDismiss={onDismiss} />
        )}
        {shown.status === "uncertain" && (
          <UncertainView message={shown.message} copy={copy} onDismiss={onDismiss} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProcessingView({ copy }: { copy: PaymentStatusCopy }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_PHASE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <StatusLayout
      icon={
        <StatusIcon className="bg-primary/10 text-primary">
          <Loader2 className="size-10 motion-safe:animate-spin" aria-hidden="true" />
        </StatusIcon>
      }
      title={copy.processing[slow ? 1 : 0]}
      description="No cierres ni recargues esta página."
    />
  );
}

function SuccessView({ copy, onContinue }: { copy: PaymentStatusCopy; onContinue: () => void }) {
  return (
    <StatusLayout
      icon={
        <StatusIcon className="bg-success/10 text-success motion-safe:animate-status-pop">
          <DrawnIcon paths={["M5 12.5l4.5 4.5L19 7.5"]} />
        </StatusIcon>
      }
      title={copy.successTitle}
      description={copy.successDescription}
    >
      <Button onClick={onContinue} variant="outline" className="h-11 w-full">
        {copy.continueLabel}
        <ArrowRight data-icon="inline-end" />
      </Button>
    </StatusLayout>
  );
}

function ErrorView({
  message,
  onRetry,
  onDismiss,
}: {
  message?: string;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  return (
    <StatusLayout
      icon={
        <StatusIcon className="bg-destructive/10 text-destructive motion-safe:animate-status-pop">
          <DrawnIcon paths={["M7 7l10 10", "M17 7L7 17"]} />
        </StatusIcon>
      }
      title="No se pudo completar el pago"
      description={message ?? "No se realizó ningún cobro. Puedes intentarlo de nuevo."}
    >
      <Button onClick={onRetry} className="h-11 w-full">
        <RotateCcw data-icon="inline-start" />
        Intentar de nuevo
      </Button>
      <Button onClick={onDismiss} variant="ghost" className="h-11 w-full">
        Cerrar
      </Button>
    </StatusLayout>
  );
}

function UncertainView({
  message,
  copy,
  onDismiss,
}: {
  message?: string;
  copy: PaymentStatusCopy;
  onDismiss: () => void;
}) {
  return (
    <StatusLayout
      icon={
        <StatusIcon className="bg-warning/15 text-warning motion-safe:animate-status-pop">
          <TriangleAlert className="size-10" aria-hidden="true" />
        </StatusIcon>
      }
      title="No pudimos confirmar tu pago"
      description={
        message ??
        `Es posible que el cobro se haya realizado. Antes de volver a intentarlo, revisa ${copy.uncertainLabel}.`
      }
    >
      <Link href={copy.uncertainHref} className={cn(buttonVariants(), "h-11 w-full")}>
        Ir a {copy.uncertainLabel}
      </Link>
      <Button onClick={onDismiss} variant="ghost" className="h-11 w-full">
        Cerrar
      </Button>
    </StatusLayout>
  );
}

function StatusLayout({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center">
      {icon}
      {/* Los lectores de pantalla anuncian cada cambio de fase y de resultado. */}
      <div role="status" aria-live="polite" className="mt-6 flex flex-col gap-2">
        <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
        <DialogDescription className="leading-relaxed">{description}</DialogDescription>
      </div>
      {children && <div className="mt-8 flex w-full flex-col gap-2">{children}</div>}
    </div>
  );
}

function StatusIcon({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div className={cn("flex size-20 items-center justify-center rounded-full", className)}>
      {children}
    </div>
  );
}

/**
 * Trazos que se dibujan al aparecer. `pathLength=1` normaliza la longitud de
 * cada trazo, así la animación no depende de su geometría. Con movimiento
 * reducido no hay animación y el trazo se ve completo.
 */
function DrawnIcon({ paths }: { paths: string[] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-10"
      aria-hidden="true"
    >
      {paths.map((d) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          className="motion-safe:animate-draw-stroke"
          style={{ strokeDasharray: 1, "--stroke-length": 1 } as CSSProperties}
        />
      ))}
    </svg>
  );
}
