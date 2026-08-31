import { Suspense } from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { SiteLogo } from '@/components/public/SiteLogo';
import { NavAuthButtons, NavAuthSkeleton } from './NavAuthButtons';
import { SocialLinks } from './SocialLinks';
import { MobileNav } from './MobileNav';
import { DesktopNavLinks } from './DesktopNavLinks';

export function SiteNavbar() {
  return (
    <>
      {/* Franja institucional */}
      <div className="hidden bg-foreground text-xs text-primary-foreground/70 md:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <a
              href="tel:+51965772053"
              className="flex items-center gap-1.5 transition-colors hover:text-primary-foreground"
            >
              <Phone className="size-3" aria-hidden="true" />
              +51 965 772 053
            </a>
            <a
              href="mailto:info@rivisig.com"
              className="flex items-center gap-1.5 transition-colors hover:text-primary-foreground"
            >
              <Mail className="size-3" aria-hidden="true" />
              info@rivisig.com
            </a>
            <span className="hidden items-center gap-1.5 text-primary-foreground/50 lg:flex">
              <MapPin className="size-3" aria-hidden="true" />
              Lima — Perú
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/verificar"
              className="flex items-center gap-1.5 font-medium transition-colors hover:text-primary-foreground"
            >
              <ShieldCheck className="size-3" aria-hidden="true" />
              Verificar certificado
            </Link>
            <span className="hidden h-3 w-px bg-primary-foreground/20 lg:block" />
            <SocialLinks className="hidden lg:flex" iconClassName="size-4" />
          </div>
        </div>
      </div>

      {/* Barra principal */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <SiteLogo />

          <DesktopNavLinks />

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-4 lg:flex">
              <Suspense fallback={<NavAuthSkeleton />}>
                <NavAuthButtons />
              </Suspense>
            </div>

            <MobileNav
              auth={
                <Suspense fallback={<NavAuthSkeleton layout="mobile" />}>
                  <NavAuthButtons layout="mobile" />
                </Suspense>
              }
            />
          </div>
        </div>
      </header>
    </>
  );
}
