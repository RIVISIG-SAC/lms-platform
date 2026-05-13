import { WhatsAppBubble } from '@/components/ui/whatsapp-bubble';
import { SiteNavbar } from './_components/SiteNavbar';
import { SiteFooter } from './_components/SiteFooter';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-0 focus:left-0 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-br-md"
      >
        Ir al contenido principal
      </a>

      <SiteNavbar />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <WhatsAppBubble />

      <SiteFooter />
    </div>
  );
}
