import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
    return <Result success="Tu correo ya fue verificado anteriormente. Puedes iniciar sesión." />;
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
      success="¡Tu correo ha sido verificado exitosamente! Ya puedes iniciar sesión."
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <Link href="/" className="inline-flex items-center gap-1 mb-2">
          <span className="text-xl font-extrabold tracking-tight text-foreground">RIV</span>
          <span className="text-xl font-extrabold tracking-tight text-primary">ISIG</span>
        </Link>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm space-y-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
              isSuccess ? "bg-green-100" : "bg-destructive/10"
            }`}
          >
            {isSuccess ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-destructive"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6M9 9l6 6" />
              </svg>
            )}
          </div>

          <h1 className={`text-xl font-bold ${isSuccess ? "text-foreground" : "text-destructive"}`}>
            {isSuccess ? "¡Cuenta verificada!" : "Error de verificación"}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {success ?? error}
          </p>

          {action ? (
            <Link
              href={action.href}
              className="inline-block bg-primary text-white text-sm font-medium px-6 py-2.5 rounded-md hover:opacity-90 transition-opacity"
            >
              {action.label}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-sm text-primary hover:underline font-medium"
            >
              Ir al inicio de sesión
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
