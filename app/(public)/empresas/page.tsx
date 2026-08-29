import { Suspense } from "react";
import { ArrowRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CompanyCard } from "@/components/public/CompanyCard";
import { getPublishedCompanies } from "@/lib/queries/empresas";

export const metadata = {
  title: { absolute: "Empresas | RIVISIG Consultores" },
  description:
    "Conoce a las empresas que confiaron en RIVISIG para certificar e implementar sus sistemas de gestión: el reto, el trabajo realizado y los resultados obtenidos.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com"}/empresas` },
};

async function CompaniesList() {
  const companies = await getPublishedCompanies();
  const [featured, ...rest] = companies;

  if (companies.length === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-border rounded-2xl bg-muted/30">
        <Building2 className="size-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-foreground font-semibold">Aún no hay casos de éxito publicados.</p>
        <p className="text-muted-foreground text-sm mt-1">Estamos preparando contenido. Vuelve pronto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {featured && (
        <CompanyCard
          slug={featured.slug}
          name={featured.name}
          sector={featured.sector}
          logoUrl={featured.logoUrl}
          heroImageUrl={featured.heroImageUrl}
          heroTitle={featured.heroTitle}
          featured
        />
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
          {rest.map((company, index) => (
            <div
              key={company.id}
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500"
              style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
            >
              <CompanyCard
                slug={company.slug}
                name={company.name}
                sector={company.sector}
                logoUrl={company.logoUrl}
                heroImageUrl={company.heroImageUrl}
                heroTitle={company.heroTitle}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompaniesListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

export default function EmpresasIndexPage() {
  return (
    <div className="pb-16">
      <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-white via-muted/40 to-white">
        <div className="absolute -top-28 -right-20 size-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-36 -left-16 size-80 rounded-full bg-foreground/5 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 md:pt-18 md:pb-16 relative motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
          <Badge variant="outline" className="mb-5 border-primary/30 bg-primary/5 text-primary">
            Casos de éxito
          </Badge>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-9">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground leading-[1.02]">
                Empresas que confiaron en RIVISIG para fortalecer su gestión
              </h1>
              <p className="text-muted-foreground mt-5 text-base max-w-2xl leading-relaxed">
                Conoce el reto, el trabajo realizado en equipo y los resultados obtenidos junto a cada organización.
              </p>
            </div>
            <div className="lg:col-span-3 lg:text-right">
              <a
                href="/servicios"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all"
              >
                Ver servicios <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Suspense fallback={<CompaniesListSkeleton />}>
          <CompaniesList />
        </Suspense>
      </section>
    </div>
  );
}
