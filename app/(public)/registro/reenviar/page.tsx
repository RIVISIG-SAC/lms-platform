import Link from "next/link";
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1 mb-2">
            <span className="text-xl font-extrabold tracking-tight text-foreground">RIV</span>
            <span className="text-xl font-extrabold tracking-tight text-primary">ISIG</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Reenviar verificación</h1>
          <p className="text-sm text-muted-foreground">
            Ingresa tu correo y te enviaremos un nuevo enlace de verificación.
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          <ResendVerificationForm />
        </div>
      </div>
    </div>
  );
}
