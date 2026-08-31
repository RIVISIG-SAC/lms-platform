"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { AuthAlert, AuthHeading } from "@/components/auth/AuthUi";
import { loginAction } from "@/app/actions/auth";

type ActionState = { error?: string } | null;
type Props = { next?: string; resetOk?: boolean };

export function LoginForm({ next, resetOk }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    loginAction,
    null,
  );

  return (
    <div className="space-y-7">
      <AuthHeading
        eyebrow="Acceso al campus"
        title={
          <>
            Bienvenido de{" "}
            <span className="text-foreground/40">vuelta</span>
          </>
        }
        description="Ingresa con tu correo y contraseña para continuar con tus cursos."
      />

      {resetOk && (
        <AuthAlert tone="success">
          Contraseña restablecida con éxito. Inicia sesión con tu nueva
          contraseña.
        </AuthAlert>
      )}

      <form action={action} className="space-y-5">
        {next && <input type="hidden" name="next" value={next} />}

        <AuthField
          id="email"
          name="email"
          type="email"
          label="Correo electrónico"
          icon={Mail}
          autoComplete="email"
          required
          placeholder="nombre@empresa.com"
        />

        <PasswordField
          id="password"
          name="password"
          label="Contraseña"
          icon={Lock}
          autoComplete="current-password"
          required
          placeholder="Tu contraseña"
          accion={
            <Link
              href="/recuperar"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          }
        />

        {state?.error && <AuthAlert tone="error">{state.error}</AuthAlert>}

        <Button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full text-sm font-bold"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Ingresando...
            </>
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link
          href={next ? `/registro?next=${encodeURIComponent(next)}` : "/registro"}
          className="font-semibold text-primary transition-opacity hover:opacity-80"
        >
          Crear una cuenta
        </Link>
      </p>
    </div>
  );
}
