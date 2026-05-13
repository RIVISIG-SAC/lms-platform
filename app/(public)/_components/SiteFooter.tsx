import Link from 'next/link';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import { SiteLogo } from '@/components/public/SiteLogo';
import { SocialLinks } from './SocialLinks';

const PLATFORM_LINKS = [
  { href: '/cursos', label: 'Cursos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/metodologia', label: 'Metodología' },
  { href: '/about', label: 'Nosotros' },
  { href: '/verificar', label: 'Verificar Certificado' },
  { href: '/registro', label: 'Crear cuenta' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 sm:col-span-2 max-w-sm">
            <SiteLogo size="sm" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Especialistas en implementación, certificación y soporte de
              Sistemas de Gestión ISO. Más de una década acompañando a empresas
              que exigen cumplimiento real.
            </p>
            <SocialLinks className="pt-2" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground mb-3">
              Plataforma
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {PLATFORM_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground mb-3">
              Contacto
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a
                href="tel:+51965772053"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                +51 965 772 053
              </a>
              <a
                href="mailto:info@rivisig.com"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                info@rivisig.com
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
            © {new Date().getFullYear()} RIVISIG Consultores. Todos los derechos
            reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Plataforma de Capacitación Profesional
          </p>
        </div>
      </div>
    </footer>
  );
}
