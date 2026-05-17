"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { requestPasswordResetAction } from "@/app/actions/password-reset";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-12 text-sm font-medium flex items-center justify-center gap-2"
    >
      {pending ? (
        "Enviando..."
      ) : (
        <>
          Enviar enlace
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </Button>
  );
}

export function RequestResetForm() {
  const [email, setEmail] = useState("");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-light text-foreground">
          Recupera tu<span className="font-semibold"> contraseña</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu correo y te enviaremos un enlace para restablecerla
        </p>
      </div>

      <form action={requestPasswordResetAction} className="space-y-6">
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 bg-background/50 border-muted-foreground/20 focus:border-primary focus:ring-0"
            />
          </div>
        </div>

        <SubmitButton />

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
