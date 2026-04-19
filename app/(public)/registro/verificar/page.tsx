import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "Revisa tu correo — RIVISIG Consultores",
};

export default async function VerificarPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/student");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <Link href="/" className="inline-flex items-center gap-1 mb-2">
          <span className="text-xl font-extrabold tracking-tight text-foreground">RIV</span>
          <span className="text-xl font-extrabold tracking-tight text-primary">ISIG</span>
        </Link>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm space-y-4">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-foreground">Revisa tu correo</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Te enviamos un enlace de verificación. Haz clic en el enlace para activar tu cuenta.
            El enlace expira en <strong>24 horas</strong>.
          </p>

          <p className="text-xs text-muted-foreground">
            ¿No recibiste el correo?{" "}
            <Link href="/registro/reenviar" className="text-primary hover:underline font-medium">
              Reenviar verificación
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
