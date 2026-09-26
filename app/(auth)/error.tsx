"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Errores inesperados en login, registro y recuperación (p. ej. la base de
 * datos cortó la conexión). Los errores de validación no llegan aquí: las
 * acciones los devuelven como `{ error }` y los muestra el propio formulario.
 */
export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[auth] error inesperado", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col text-center" role="alert">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        Algo salió mal
      </p>
      <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground">
        No pudimos completar tu solicitud
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Fue un problema temporal de nuestro lado, no de tus datos. Inténtalo de
        nuevo en unos segundos.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={reset} className="h-11 w-full text-base font-semibold">
          <RotateCcw className="size-4" aria-hidden="true" />
          Intentar de nuevo
        </Button>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "h-11 w-full")}>
          Volver al inicio
        </Link>
      </div>

      {error.digest && (
        <p className="mt-6 text-xs text-muted-foreground">Código de referencia: {error.digest}</p>
      )}
    </div>
  );
}
