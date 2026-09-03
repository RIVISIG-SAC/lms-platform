'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from './nav-links';

/**
 * Navegación principal de escritorio. Sin iconos a propósito: a este tamaño
 * no aportan significado y ensucian la lectura de la fila. El estado activo
 * y el hover comparten el mismo subrayado, anclado al borde del header.
 */
export function DesktopNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex lg:items-center lg:gap-1" aria-label="Principal">
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'group relative flex h-18 items-center px-3.5 text-sm transition-colors',
              isActive
                ? 'font-semibold text-foreground'
                : 'font-medium text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
            <span
              className={cn(
                'absolute inset-x-3 bottom-0 h-0.5 rounded-full transition-colors',
                isActive
                  ? 'bg-primary'
                  : 'bg-transparent group-hover:bg-border',
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
