"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  Loader2,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthField, PasswordField } from "@/components/auth/AuthField";
import { AuthAlert, AuthHeading } from "@/components/auth/AuthUi";
import { registerAction } from "@/app/actions/register";
import { cn } from "@/lib/utils";

type ActionState = { error?: string } | null;
type Props = { next?: string };

/** Mismas reglas que `registerSchema` en lib/validations/auth.ts. */
const REGLAS = [
  { label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { label: "Una letra mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Un número", test: (v: string) => /[0-9]/.test(v) },
];

function Regla({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors",
        ok ? "text-emerald-700" : "text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "inline-flex size-4 shrink-0 items-center justify-center rounded-full",
          ok ? "bg-emerald-100" : "bg-muted",
        )}
      >
        {ok ? <Check className="size-2.5" /> : <X className="size-2.5" />}
      </span>
      {label}
    </li>
  );
}

export function RegisterForm({ next }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    registerAction,
    null,
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const cumplidas = REGLAS.filter((r) => r.test(password)).length;
  const fuerza = password ? (cumplidas / REGLAS.length) * 100 : 0;
  const coinciden = confirm.length > 0 && confirm === password;

  return (
    <div className="space-y-7">
      <AuthHeading
        eyebrow="Nueva cuenta"
        title={
          <>
            Crea tu <span className="text-foreground/40">cuenta</span>
          </>
        }
        description="Regístrate para inscribirte a los cursos y gestionar tus certificados."
      />

      <form action={action} className="space-y-5">
        {next && <input type="hidden" name="next" value={next} />}

        <AuthField
          id="name"
          name="name"
          type="text"
          label="Nombre completo"
          icon={User}
          autoComplete="name"
          required
          placeholder="Tu nombre completo"
        />

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

        <div className="grid gap-5 sm:grid-cols-2">
          <AuthField
            id="dni"
            name="dni"
            type="text"
            inputMode="numeric"
            maxLength={12}
            label="DNI"
            icon={CreditCard}
            autoComplete="off"
            placeholder="12345678"
            hint={
              <p className="text-[11px] text-muted-foreground">
                Aparecerá en tu certificado.
              </p>
            }
          />

          <AuthField
            id="company"
            name="company"
            type="text"
            label={
              <>
                Empresa{" "}
                <span className="font-normal text-muted-foreground/60">
                  (opcional)
                </span>
              </>
            }
            icon={Building2}
            autoComplete="organization"
            maxLength={100}
            placeholder="Tu empresa"
          />
        </div>

        <PasswordField
          id="password"
          name="password"
          label="Contraseña"
          icon={Lock}
          autoComplete="new-password"
          required
          placeholder="Crea una contraseña segura"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={
            <div className="space-y-2 pt-1">
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    cumplidas === REGLAS.length
                      ? "bg-emerald-500"
                      : cumplidas === 2
                        ? "bg-amber-500"
                        : "bg-destructive",
                  )}
                  style={{ width: `${fuerza}%` }}
                />
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {REGLAS.map((r) => (
                  <Regla key={r.label} ok={r.test(password)} label={r.label} />
                ))}
              </ul>
            </div>
          }
        />

        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirmar contraseña"
          icon={Lock}
          autoComplete="new-password"
          required
          placeholder="Repite tu contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          hint={
            confirm.length > 0 ? (
              <p
                className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-medium",
                  coinciden ? "text-emerald-700" : "text-destructive",
                )}
              >
                {coinciden ? (
                  <Check className="size-3" />
                ) : (
                  <X className="size-3" />
                )}
                {coinciden
                  ? "Las contraseñas coinciden"
                  : "Las contraseñas no coinciden"}
              </p>
            ) : undefined
          }
        />

        <label
          htmlFor="acceptTerms"
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/30 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40"
        >
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-muted-foreground/30 accent-primary focus:ring-2 focus:ring-primary/40"
          />
          <span className="text-xs leading-relaxed text-muted-foreground">
            Acepto los{" "}
            <Link
              href="/terminos-y-condiciones"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Términos y Condiciones
            </Link>{" "}
            y la{" "}
            <Link
              href="/politica-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Política de Privacidad
            </Link>
            .
          </span>
        </label>

        {state?.error && <AuthAlert tone="error">{state.error}</AuthAlert>}

        <Button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full text-sm font-bold"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creando cuenta...
            </>
          ) : (
            <>
              Crear cuenta
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Te enviaremos un correo para verificar tu cuenta antes de poder
          ingresar.
        </p>
      </form>

      <p className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-semibold text-primary transition-opacity hover:opacity-80"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
