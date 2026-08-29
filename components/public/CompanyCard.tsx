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
        className={`h-full overflow-hidden border-border/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 gap-0 py-0 rounded-2xl ${
          featured ? "md:grid md:grid-cols-2" : ""
        }`}
      >
        <div
          className={`overflow-hidden bg-muted relative ${featured ? "aspect-video md:aspect-auto md:h-full" : "aspect-video"}`}
        >
          {heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/90 via-primary to-foreground flex items-center justify-center">
              <Building2 className="h-12 w-12 text-white/25" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
          {sector && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/95 text-foreground border-0 text-[11px] font-semibold">{sector}</Badge>
            </div>
          )}
          {logoUrl && (
            <div className="absolute bottom-3 right-3 size-10 rounded-lg bg-white/95 border border-border/60 shadow-sm flex items-center justify-center overflow-hidden p-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={`Logo ${name}`} className="w-full h-full object-contain" />
            </div>
          )}
        </div>

        <CardContent className={`p-5 sm:p-6 flex flex-col ${featured ? "md:p-8 md:justify-center" : ""}`}>
          <h3
            className={`font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors duration-300 ${
              featured ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
            }`}
          >
            {name}
          </h3>

          {heroTitle && (
            <p
              className={`text-muted-foreground leading-relaxed mb-4 ${
                featured ? "text-base line-clamp-3" : "text-sm line-clamp-2"
              }`}
            >
              {heroTitle}
            </p>
          )}

          <div className="mt-auto flex items-center justify-end">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              Ver caso <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
