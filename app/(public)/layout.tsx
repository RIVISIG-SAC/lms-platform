import Link from "next/link";
import { getSession } from "@/lib/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Phone, Mail, Globe, MonitorPlay, Info, BadgeCheck, Book, MapPin } from "lucide-react";
import { SiteLogo } from "@/components/public/SiteLogo";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-0 focus:left-0 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-br-md"
      >
        Ir al contenido principal
      </a>
      {/* Top bar — institutional strip */}
      <div className="hidden md:block bg-foreground text-primary-foreground/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="tel:+51965772053" className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors">
              <Phone className="h-3 w-3" aria-hidden="true" />
              +51 965 772 053
            </a>
            <a href="mailto:info@rivisig.com" className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors">
              <Mail className="h-3 w-3" aria-hidden="true" />
              info@rivisig.com
            </a>
            <span className="hidden lg:flex items-center gap-1.5 text-primary-foreground/60">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              Lima — Perú
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-primary-foreground/60">Síguenos:</span>
            <a href="#" aria-label="LinkedIn" className="hover:text-primary-foreground transition-colors font-semibold">in</a>
            <a href="#" aria-label="Facebook" className="hover:text-primary-foreground transition-colors font-semibold">f</a>
            <a href="#" aria-label="Instagram" className="hover:text-primary-foreground transition-colors font-semibold">ig</a>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* === IMAGE SLOT: Logo principal ===
              Archivo esperado: /public/images/logo.png  (~ 320 × 80 px, fondo transparente).
              Si no existe, se muestra el wordmark "RIVISIG" como fallback. */}
          <SiteLogo />

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/cursos" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <MonitorPlay className="h-4 w-4" aria-hidden="true" />
              Cursos
            </Link>
            <Link href="/servicios" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Book className="h-4 w-4" aria-hidden="true" />
              Servicios
            </Link>
            <Link href="/metodologia" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Metodología
            </Link>
            <Link href="/about" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Info className="h-4 w-4" aria-hidden="true" />
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
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
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

      <main id="main-content" className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3 sm:col-span-2 max-w-sm">
              <SiteLogo size="sm" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Especialistas en implementación, certificación y soporte de Sistemas de Gestión ISO.
                Más de una década acompañando a empresas que exigen cumplimiento real.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a href="#" aria-label="LinkedIn" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">in</a>
                <a href="#" aria-label="Facebook" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">f</a>
                <a href="#" aria-label="Instagram" className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">ig</a>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground mb-3">Plataforma</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/cursos" className="hover:text-foreground transition-colors">Cursos</Link></li>
                <li><Link href="/servicios" className="hover:text-foreground transition-colors">Servicios</Link></li>
                <li><Link href="/metodologia" className="hover:text-foreground transition-colors">Metodología</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">Nosotros</Link></li>
                <li><Link href="/registro" className="hover:text-foreground transition-colors">Crear cuenta</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground mb-3">Contacto</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="tel:+51965772053" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  +51 965 772 053
                </a>
                <a href="mailto:info@rivisig.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  info@rivisig.com
                </a>
                <a href="https://rivisig.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  rivisig.com
                </a>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  Lima — Perú
                </div>
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
