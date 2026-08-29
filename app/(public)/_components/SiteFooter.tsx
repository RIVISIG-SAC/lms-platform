import Link from 'next/link';
import { Phone, Mail, Globe, MapPin } from 'lucide-react';
import { SiteLogo } from '@/components/public/SiteLogo';
import { SocialLinks } from './SocialLinks';
import { LEGAL_COMPANY } from '@/lib/legal/company';

const PLATFORM_LINKS = [
  { href: '/cursos', label: 'Cursos' },
  { href: '/servicios', label: 'Servicios' },
  { href: '/metodologia', label: 'Metodología' },
  { href: '/about', label: 'Nosotros' },
  { href: '/verificar', label: 'Verificar Certificado' },
  { href: '/registro', label: 'Crear cuenta' },
];

const LEGAL_LINKS = [
  { href: '/terminos-y-condiciones', label: 'Términos y Condiciones' },
  { href: '/politica-de-privacidad', label: 'Política de Privacidad' },
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

        <div className="border-t border-border pt-6 space-y-4">
          <nav aria-label="Enlaces legales">
            <ul className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {LEGAL_LINKS.map(({ href, label }, idx) => (
                <li key={href} className="flex items-center gap-3">
                  <Link
                    href={href}
                    className="hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                  {idx < LEGAL_LINKS.length - 1 && (
                    <span aria-hidden="true" className="text-border">
                      ·
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col sm:flex-row items-center justify-center text-xs text-muted-foreground">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} {LEGAL_COMPANY.razonSocial}
              <span aria-hidden="true" className="mx-2 text-border">
                ·
              </span>
              Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
