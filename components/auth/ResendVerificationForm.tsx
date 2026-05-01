"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/app/actions/resend-verification";

export function ResendVerificationForm() {
  const [state, action, pending] = useActionState(resendVerificationAction, null);

  if (state?.success) {
    return (
      <div className="space-y-5 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-foreground bg-primary/5 border border-primary/20 px-3.5 py-3 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span>Si existe una cuenta sin verificar, te enviamos un nuevo enlace. Revisa tu bandeja de entrada.</span>
        </div>
        <Link href="/login" className="block text-sm text-primary hover:underline font-medium">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nombre@empresa.com"
          required
          autoComplete="email"
        />
      </div>

      {state?.error && (
        <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3.5 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full h-11 text-sm font-medium">
        {pending ? "Enviando..." : "Reenviar enlace"}
      </Button>

      <div className="text-center">
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
