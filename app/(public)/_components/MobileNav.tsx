'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from './nav-links';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center size-9 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-18 z-40 bg-black/20"
          />
          <nav className="fixed inset-x-0 top-18 z-50 border-b border-border bg-white shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-200">
            <ul className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-1">
              {NAV_LINKS.map(({ href, label, Icon }) => {
                const isActive = pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent',
                        isActive ? 'bg-primary/5 text-primary' : 'text-foreground'
                      )}
                    >
                      <Icon className="size-4 text-primary" aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
