import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  slug: string;
  name: string;
  sector?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  heroTitle?: string | null;
  featured?: boolean;
};

export function CompanyCard({ slug, name, sector, logoUrl, heroImageUrl, heroTitle, featured = false }: Props) {
  return (
    <Link
      href={`/empresas/${slug}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    >
      <Card
        className={`h-full gap-0 overflow-hidden rounded-2xl border-border/70 bg-white py-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-black/10 ${
          featured ? "md:grid md:grid-cols-2" : ""
        }`}
      >
        {/* Imagen */}
        <div
          className={`relative overflow-hidden bg-muted ${
            featured ? "aspect-video md:aspect-auto md:h-full" : "aspect-16/10"
          }`}
        >
          {heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImageUrl}
              alt={name}
              loading={featured ? undefined : "lazy"}
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-linear-to-br from-primary/90 via-primary to-foreground">
              <Building2 className="size-12 text-white/25" aria-hidden="true" />
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />

          {sector && (
            <Badge className="absolute left-3 top-3 border-0 bg-white/95 text-[11px] font-semibold text-foreground">
              {sector}
            </Badge>
          )}
        </div>

        {/* Contenido */}
        <CardContent
          className={`relative flex flex-col p-5 sm:p-6 ${featured ? "md:justify-center md:p-9" : ""}`}
        >
          {/* Placa de marca montada sobre la imagen */}
          {logoUrl && (
            <div
              className={`absolute flex h-14 w-20 items-center justify-center rounded-xl border border-border/70 bg-white p-2 shadow-md shadow-black/5 transition-transform duration-300 group-hover:-translate-y-0.5 ${
                featured ? "-top-7 left-9 md:-left-10 md:top-9" : "-top-7 left-5 sm:left-6"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={`Logo de ${name}`} className="max-h-9 w-full object-contain" />
            </div>
          )}

          <div className={`mb-5 ${logoUrl ? (featured ? "pt-8 md:pt-0" : "pt-8") : ""}`}>
            <h3
              className={`font-bold leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary ${
                featured ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
              }`}
            >
              {name}
            </h3>

            {heroTitle && (
              <p
                className={`mt-2.5 leading-relaxed text-muted-foreground ${
                  featured ? "line-clamp-3 text-base" : "line-clamp-2 text-sm"
                }`}
              >
                {heroTitle}
              </p>
            )}
          </div>

          <div
            className={`flex items-center justify-between gap-3 border-t border-border/70 pt-4 ${
              featured ? "" : "mt-auto"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Caso de éxito
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              Ver caso
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
