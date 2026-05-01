import Link from "next/link";
import { SiteLogo } from "@/components/public/SiteLogo";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-border">
        <SiteLogo href="/" />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Volver
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo above form - desktop */}
          <div className="hidden lg:flex justify-center mb-10">
            <SiteLogo href="/" size="md" />
          </div>

          {/* Desktop back link */}
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver al inicio
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}