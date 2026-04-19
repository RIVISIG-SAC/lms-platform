import Link from "next/link";
import { getSession } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Phone, Mail, Globe } from "lucide-react";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-extrabold tracking-tight text-foreground">RIV</span>
            <span className="text-xl font-extrabold tracking-tight text-primary">ISIG</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/cursos" className="hover:text-foreground transition-colors">
              Cursos
            </Link>
            <Link href="/servicios" className="hover:text-foreground transition-colors">
              Servicios
            </Link>
            <Link href="/metodologia" className="hover:text-foreground transition-colors">
              Metodología
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              Nosotros
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-1 mb-3">
                <span className="font-extrabold text-foreground">RIV</span>
                <span className="font-extrabold text-primary">ISIG</span>
                <span className="text-muted-foreground text-sm font-medium ml-1">Consultores</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Especialistas en implementación, certificación y soporte de Sistemas de Gestión ISO.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground mb-3">Plataforma</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/cursos" className="hover:text-foreground transition-colors">Cursos</Link></li>
                <li><Link href="/registro" className="hover:text-foreground transition-colors">Crear cuenta</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground mb-3">Contacto</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="tel:+51965772053" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  +51 965 772 053
                </a>
                <a href="mailto:info@rivisig.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  info@rivisig.com
                </a>
                <a href="https://rivisig.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  rivisig.com
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} RIVISIG Consultores. Todos los derechos reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Plataforma de Capacitación Profesional
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
