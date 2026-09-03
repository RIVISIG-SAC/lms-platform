'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from './nav-links';

type Props = {
  /** Botones de sesión renderizados en el servidor por SiteNavbar. */
  auth: React.ReactNode;
};

export function MobileNav({ auth }: Props) {
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
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex size-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent lg:hidden"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <>
          {/* El panel se ancla al header (sticky) con `top-full`, así no depende
              de la altura de la franja institucional, que solo existe en md+. */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/20 lg:hidden"
          />
          <div className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-border bg-background shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-200 lg:hidden">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <nav aria-label="Principal">
                <ul className="space-y-0.5">
                  {NAV_LINKS.map(({ href, label, Icon }) => {
                    const isActive =
                      pathname === href || pathname.startsWith(`${href}/`);

                    return (
                      <li key={href}>
                        <Link
                          href={href}
                          aria-current={isActive ? 'page' : undefined}
                          className={cn(
                            'flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors',
                            isActive
                              ? 'bg-primary/5 font-semibold text-primary'
                              : 'font-medium text-foreground hover:bg-accent',
                          )}
                        >
                          <Icon
                            className={cn(
                              'size-4 shrink-0',
                              isActive ? 'text-primary' : 'text-muted-foreground',
                            )}
                            aria-hidden="true"
                          />
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-4 border-t border-border pt-4">{auth}</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
