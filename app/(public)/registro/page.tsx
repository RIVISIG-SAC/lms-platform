import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Crear cuenta — RIVISIG Consultores",
};

const BENEFITS = [
  "Cursos con certificación reconocida a nivel nacional",
  "Acceso inmediato al material de estudio",
  "Soporte de consultores especializados",
  "Certificados válidos ante organismos reguladores",
];

export default async function RegistroPage(props: { searchParams: Promise<unknown> }) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/student");
  }

  const sp = (await props.searchParams) as Record<string, string | undefined>;
  const next = sp.next ?? undefined;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-linear-to-b from-white to-muted/40 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* ── Left: Value props ─────────────────────── */}
        <div className="order-2 lg:order-1 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Plataforma certificada
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight tracking-tight">
              Accede a capacitación{" "}
              <span className="text-primary">de nivel internacional</span>
            </h1>

            <p className="text-muted-foreground leading-relaxed">
              Crea tu cuenta y comienza a desarrollar competencias en Sistemas de
              Gestión ISO con el respaldo de RIVISIG Consultores.
            </p>
          </div>

          <ul className="space-y-3">
            {BENEFITS.map((text) => (
              <li key={text} className="flex items-start gap-3 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {text}
              </li>
            ))}
          </ul>

          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link
              href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
              className="text-primary hover:underline font-medium"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {/* ── Right: Form card ──────────────────────── */}
        <div className="order-1 lg:order-2 bg-white border border-border rounded-2xl p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground">Crear cuenta</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {next
                ? "Regístrate para continuar con tu compra"
                : "Completa el formulario para comenzar"}
            </p>
          </div>
          <RegisterForm next={next} />
        </div>

      </div>
    </section>
  );
}
