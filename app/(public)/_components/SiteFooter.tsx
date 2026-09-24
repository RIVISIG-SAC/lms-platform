import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin } from 'lucide-react';
import { SiteLogo } from '@/components/public/SiteLogo';
import { SocialLinks } from './SocialLinks';
import { FooterLegalLinks } from './FooterLegalLinks';
import { LEGAL_COMPANY } from '@/lib/legal/company';

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
            {/* INDECOPI exige que el Libro de Reclamaciones sea visible en la web. */}
            <Link
              href="/libro-de-reclamaciones"
              className="mt-2 inline-block rounded-lg border border-border p-1.5 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Image
                src="/images/libro_reclamaciones.webp"
                alt="Libro de Reclamaciones"
                width={883}
                height={565}
                sizes="140px"
                className="h-auto w-[140px]"
              />
            </Link>
          </div>
        </div>

        {/* pb-8 + el py-12 del contenedor = 5rem, la altura que ocupa el botón (bottom-6 + size-14). Hueco para que el botón flotante de WhatsApp no tape esta fila al final de la página. */}
        <div className="flex flex-col-reverse items-center gap-3 border-t border-border pt-6 pb-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {LEGAL_COMPANY.razonSocial}
            <span aria-hidden="true" className="mx-2 text-border">
              ·
            </span>
            RUC {LEGAL_COMPANY.ruc}
          </p>
          <FooterLegalLinks />
        </div>
      </div>
    </footer>
  );
}
