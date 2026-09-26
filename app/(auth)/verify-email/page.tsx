import type { ReactNode } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, buttonVariants } from "@/components/ui/button";
import { PetMascot } from "@/components/public/PetMascot";
import { CourseIntentCard } from "@/components/auth/CourseIntentCard";
import { cn } from "@/lib/utils";
import { sanitizeNextPath, withNextParam } from "@/lib/navigation/next-path";

export const metadata = {
  title: "Verificando cuenta — RIVISIG Consultores",
};

type Props = {
  searchParams: Promise<{ token?: string; next?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token, next: rawNext } = await searchParams;
  const next = sanitizeNextPath(rawNext);
  // Conservamos el destino en el enlace de login: ahí se consume la
  // inscripción pendiente y se devuelve al estudiante a su curso.
  const loginHref = withNextParam("/login", next);

  if (!token) {
    return <Result error="Enlace de verificación inválido." />;
  }

  const user = await prisma.user.findUnique({
    where: { verificationToken: token },
  });

  if (!user) {
    return <Result error="El enlace de verificación no es válido o ya fue utilizado." />;
  }

  if (user.emailVerified) {
    return (
      <Result
        success="Tu correo ya fue verificado anteriormente."
        action={{ href: loginHref, label: "Iniciar sesión" }}
        intent={<CourseIntentCard next={next} stage="verificado" />}
      />
    );
  }

  if (!user.verificationTokenExp || user.verificationTokenExp < new Date()) {
    return (
      <Result
        error="El enlace de verificación ha expirado."
        action={{ href: "/registro/reenviar", label: "Solicitar nuevo enlace" }}
      />
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExp: null,
    },
  });

  return (
    <Result
      success="¡Tu correo ha sido verificado exitosamente!"
      action={{ href: loginHref, label: "Iniciar sesión" }}
      intent={<CourseIntentCard next={next} stage="verificado" />}
    />
  );
}

function Result({
  success,
  error,
  action,
  intent,
}: {
  success?: string;
  error?: string;
  action?: { href: string; label: string };
  /** Curso que el estudiante quería, para que retome la compra. */
  intent?: ReactNode;
}) {
  const isSuccess = Boolean(success);

  return (
    <div className="space-y-6 text-center">
      <PetMascot
        pose={isSuccess ? "exito" : "confundido"}
        size={200}
        className="mx-auto h-auto w-32"
      />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {isSuccess ? "¡Cuenta verificada!" : "Error de verificación"}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {success ?? error}
        </p>
      </div>

      {intent}

      {action ? (
        <Link href={action.href} className={cn(buttonVariants(), "w-full h-11 text-sm font-medium")}>
          {action.label}
        </Link>
      ) : (
        <Link href="/login" className="text-sm text-primary hover:underline font-medium">
          Ir al inicio de sesión
        </Link>
      )}
    </div>
  );
}
