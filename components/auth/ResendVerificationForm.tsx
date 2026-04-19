"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/app/actions/resend-verification";

export function ResendVerificationForm() {
  const [state, action, pending] = useActionState(resendVerificationAction, null);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Si existe una cuenta sin verificar con ese correo, te enviamos un nuevo enlace. Revisa tu bandeja de entrada.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline font-medium">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="correo@empresa.com"
          required
          autoComplete="email"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full h-11 text-base">
        {pending ? "Enviando..." : "Reenviar enlace"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline font-medium">
          Volver al inicio de sesión
        </Link>
      </p>
    </form>
  );
}
