import Link from "next/link";
import { getSession } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">Cursos</span>
            <span className="text-xl font-bold text-foreground">Pro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/cursos" className="hover:text-foreground transition-colors">
              Cursos
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={session.role === "ADMIN" ? "/admin" : "/student"}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Mi Panel
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className={cn(buttonVariants({ size: "sm" }))}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">Cursos</span>
            <span className="font-bold text-foreground">Pro</span>
            <span className="text-muted-foreground text-sm">
              · Plataforma de Capacitación Profesional
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Cursos Pro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
