import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ResendVerificationForm } from "@/components/auth/ResendVerificationForm";

export const metadata = {
  title: "Reenviar verificación — RIVISIG Consultores",
};

export default async function ReenviarPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/student");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reenviar verificación</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ingresa tu correo y te enviaremos un nuevo enlace de verificación.
        </p>
      </div>

      <ResendVerificationForm />
    </div>
  );
}
