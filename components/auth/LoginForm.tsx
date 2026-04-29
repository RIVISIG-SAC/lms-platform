"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/app/actions/auth";

type ActionState = { error?: string } | null;
type Props = { next?: string };

export function LoginForm({ next }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    null
  );

  return (
    <form action={action} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nombre@empresa.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <div className="flex items-start gap-2.5 text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3.5 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full h-11 text-sm font-medium">
        {pending ? "Ingresando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
