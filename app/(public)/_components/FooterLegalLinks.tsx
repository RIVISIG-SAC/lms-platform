'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/** Etiqueta corta para la fila del footer; `title` es el nombre completo del documento. */
const LEGAL_LINKS = [
  { href: '/terminos-y-condiciones', label: 'Términos', title: 'Términos y Condiciones' },
  { href: '/politica-de-privacidad', label: 'Privacidad', title: 'Política de Privacidad' },
  { href: '/politica-de-cookies', label: 'Cookies', title: 'Política de Cookies' },
  {
    href: '/politica-de-devoluciones',
    label: 'Reembolsos',
    title: 'Política de Reembolsos y Devoluciones',
  },
];

export function FooterLegalLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Enlaces legales" className={className}>
      <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-end">
        {LEGAL_LINKS.map(({ href, label, title }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={title}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'transition-colors hover:text-foreground',
                  active && 'font-semibold text-foreground',
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
