"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/app/actions/password-reset";

type ActionState = { error?: string } | null;
type Props = { token: string };

export function ResetPasswordForm({ token }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    null,
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-light text-foreground">
          Crea tu nueva<span className="font-semibold"> contraseña</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Elige una contraseña segura para tu cuenta
        </p>
      </div>

      <form action={action} className="space-y-6">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-xs font-medium text-muted-foreground">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Mínimo 8 caracteres"
                className="pl-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-0"
              />
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              Debe incluir una mayúscula y un número
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Repite tu nueva contraseña"
                className="pl-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-0"
              />
            </div>
          </div>
        </div>

        {state?.error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/5 border border-destructive/10 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{state.error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-full h-12 text-sm font-medium flex items-center justify-center gap-2"
        >
          {pending ? (
            "Guardando..."
          ) : (
            <>
              Restablecer contraseña
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Volver al{" "}
            <span className="font-medium text-primary">inicio de sesión</span>
          </Link>
        </div>
      </form>
    </div>
  );
}
