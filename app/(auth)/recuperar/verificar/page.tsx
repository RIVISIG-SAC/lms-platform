import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Mail } from "lucide-react";

export const metadata = {
  title: "Revisa tu correo — RIVISIG Consultores",
};

export default async function RecuperarVerificarPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/student");
  }

  return (
    <div className="space-y-6 text-center">
      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Mail className="size-7 text-primary" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Revisa tu correo</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Si el correo está registrado, te enviamos un enlace para restablecer tu
          contraseña. El enlace expira en <strong>1 hora</strong>.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        ¿No recibiste el correo?{" "}
        <Link
          href="/recuperar"
          className="text-primary hover:underline font-medium"
        >
          Intenta de nuevo
        </Link>
      </p>

      <Link
        href="/login"
        className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Volver al inicio de sesión
      </Link>
    </div>
  );
}
