"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, Mail, Lock, ArrowRight } from "lucide-react";
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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-light text-foreground">
          Bienvenido de<span className="font-semibold"> vuelta</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      <form action={action} className="space-y-6">
        {next && <input type="hidden" name="next" value={next} />}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              Correo electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="nombre@empresa.com"
                className="pl-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
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
            "Ingresando..."
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>

        <div className="text-center pt-2">
          <Link
            href="/registro"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ¿No tienes cuenta?{' '}
            <span className="font-medium text-primary">Regístrate</span>
          </Link>
        </div>
      </form>
    </div>
  );
}