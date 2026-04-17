import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Crear cuenta — Cursos Pro",
};

export default async function RegistroPage(props: { searchParams: Promise<unknown> }) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/student");
  }

  const sp = (await props.searchParams) as Record<string, string | undefined>;
  const next = sp.next ?? undefined;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1 mb-2">
            <span className="text-xl font-bold text-primary">Cursos</span>
            <span className="text-xl font-bold text-foreground">Pro</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Crea tu cuenta</h1>
          {next ? (
            <p className="text-sm text-muted-foreground">
              Regístrate para continuar con tu compra
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Accede a cursos de capacitación certificada
            </p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          <RegisterForm next={next} />
        </div>
      </div>
    </div>
  );
}
