import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Iniciar Sesión | Cursos Pro",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Cursos Pro
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Plataforma de Capacitación Profesional
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8 shadow-sm">
        <h2 className="text-lg font-medium text-[var(--foreground)] mb-6">
          Iniciar Sesión
        </h2>
        <LoginForm />
      </div>
    </div>
  );
}
