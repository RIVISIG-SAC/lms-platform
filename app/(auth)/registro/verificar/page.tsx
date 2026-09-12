import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PetMascot } from "@/components/public/PetMascot";

export const metadata = {
  title: "Revisa tu correo — RIVISIG Consultores",
};

export default async function VerificarPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/student");
  }

  return (
    <div className="space-y-6 text-center">
      <PetMascot pose="ok" size={200} className="mx-auto h-auto w-32" />

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Revisa tu correo</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Te enviamos un enlace de verificación. Haz clic en el enlace para activar
          tu cuenta. El enlace expira en <strong>24 horas</strong>.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        ¿No recibiste el correo?{" "}
        <Link
          href="/registro/reenviar"
          className="text-primary hover:underline font-medium"
        >
          Reenviar verificación
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
