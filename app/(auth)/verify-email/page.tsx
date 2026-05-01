import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button, buttonVariants } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Verificando cuenta — RIVISIG Consultores",
};

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

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
        action={{ href: "/login", label: "Iniciar sesión" }}
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
      action={{ href: "/login", label: "Iniciar sesión" }}
    />
  );
}

function Result({
  success,
  error,
  action,
}: {
  success?: string;
  error?: string;
  action?: { href: string; label: string };
}) {
  const isSuccess = Boolean(success);

  return (
    <div className="space-y-6 text-center">
      <div
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center mx-auto",
          isSuccess ? "bg-primary/10" : "bg-destructive/10"
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="size-7 text-primary" />
        ) : (
          <XCircle className="size-7 text-destructive" />
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {isSuccess ? "¡Cuenta verificada!" : "Error de verificación"}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {success ?? error}
        </p>
      </div>

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
