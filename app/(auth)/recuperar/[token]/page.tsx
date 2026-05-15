import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Restablecer contraseña — RIVISIG Consultores",
};

type Props = {
  params: Promise<{ token: string }>;
};

export default async function RecuperarTokenPage({ params }: Props) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/student");
  }

  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
    select: { id: true, passwordResetTokenExp: true },
  });

  const isValid =
    !!user &&
    !!user.passwordResetTokenExp &&
    user.passwordResetTokenExp > new Date();

  if (!isValid) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="size-7 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Enlace inválido</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este enlace de restablecimiento es inválido o ya expiró. Solicita uno
            nuevo para restablecer tu contraseña.
          </p>
        </div>

        <Link
          href="/recuperar"
          className="inline-block text-sm text-primary hover:underline font-medium"
        >
          Solicitar nuevo enlace
        </Link>

        <Link
          href="/login"
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
