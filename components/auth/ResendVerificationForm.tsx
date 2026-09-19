"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/app/actions/resend-verification";

type Props = { next?: string };

export function ResendVerificationForm({ next }: Props) {
  const [state, action, pending] = useActionState(resendVerificationAction, null);
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  if (state?.success) {
    return (
      <div className="space-y-5 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-foreground bg-primary/5 border border-primary/20 px-3.5 py-3 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span>Si existe una cuenta sin verificar, te enviamos un nuevo enlace. Revisa tu bandeja de entrada.</span>
        </div>
        <Link href={loginHref} className="block text-sm text-primary hover:underline font-medium">
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

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
        <Link href={loginHref} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}
