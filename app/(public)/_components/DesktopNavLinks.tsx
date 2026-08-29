'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from './nav-links';

export function DesktopNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
      {NAV_LINKS.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex items-center gap-2 py-2 transition-colors hover:text-foreground',
              isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
            {isActive && (
              <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 rounded-full bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
