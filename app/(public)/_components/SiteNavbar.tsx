import { Suspense } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { SiteLogo } from '@/components/public/SiteLogo';
import { NavAuthButtons, NavAuthSkeleton } from './NavAuthButtons';
import { SocialLinks } from './SocialLinks';
import { MobileNav } from './MobileNav';
import { DesktopNavLinks } from './DesktopNavLinks';

export function SiteNavbar() {
  return (
    <>
      {/* Top bar — institutional strip */}
      <div className="hidden md:block bg-foreground text-primary-foreground/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="tel:+51965772053"
              className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
            >
              <Phone className="h-3 w-3" aria-hidden="true" />
              +51 965 772 053
            </a>
            <a
              href="mailto:info@rivisig.com"
              className="flex items-center gap-1.5 hover:text-primary-foreground transition-colors"
            >
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
            <SocialLinks />
          </div>
        </div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <SiteLogo />

          <DesktopNavLinks />

          <div className="flex items-center gap-3">
            <Suspense fallback={<NavAuthSkeleton />}>
              <NavAuthButtons />
            </Suspense>
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  );
}
