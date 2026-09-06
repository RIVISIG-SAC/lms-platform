import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  slug: string;
  name: string;
  sector?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  heroTitle?: string | null;
};

export function CompanyCard({ slug, name, sector, logoUrl, heroImageUrl, heroTitle }: Props) {
  return (
    <Link
      href={`/empresas/${slug}`}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    >
      <Card className="h-full gap-0 overflow-hidden rounded-2xl border-border/70 bg-white py-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-black/10">
        <div className="flex h-full flex-col">
          {/* Cabecera de marca */}
          <div className="flex h-[4.75rem] items-center justify-between gap-4 border-b border-border/70 bg-muted/30 px-5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={`Logo de ${name}`}
                className="h-11 w-auto max-w-[60%] object-contain object-left transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Building2 className="size-4 text-primary" aria-hidden="true" />
                {name}
              </span>
            )}

            {sector && (
              <span className="shrink-0 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                {sector}
              </span>
            )}
          </div>

          {/* Imagen */}
          <div className="relative aspect-16/10 overflow-hidden bg-muted">
            {heroImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImageUrl}
                alt={name}
                loading="lazy"
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-linear-to-br from-primary/90 via-primary to-foreground">
                <Building2 className="size-12 text-white/25" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-lg font-bold leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-xl">
              {name}
            </h3>
            {heroTitle && (
              <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{heroTitle}</p>
            )}
            <div className="mt-auto flex justify-end pt-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                Ver caso
                <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
