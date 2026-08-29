import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Target,
  ShieldCheck,
  Users,
  Search,
  ClipboardList,
  FileText,
  GraduationCap,
  Settings,
  BadgeCheck,
  Megaphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCompanyBySlug } from "@/lib/queries/empresas";
import { getCompanyIcon } from "@/lib/empresas/icons";
import { CompanyGallery } from "@/components/public/CompanyGallery";
import { ImageCarousel } from "@/components/public/ImageCarousel";
import { TestimonialVideo } from "@/components/public/TestimonialVideo";

type Params = Promise<{ slug: string }>;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

const IMPLEMENTATION_STEPS = [
  { label: "Diagnóstico", Icon: Search },
  { label: "Planificación", Icon: ClipboardList },
  { label: "Diseño Documental", Icon: FileText },
  { label: "Capacitación", Icon: GraduationCap },
  { label: "Implementación", Icon: Settings },
  { label: "Auditoría Interna", Icon: ShieldCheck },
  { label: "Certificación", Icon: BadgeCheck },
] as const;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return { title: "Empresa no encontrada" };
  }

  const title = company.seoTitle || company.name;
  const description = company.seoDescription || company.heroSubtitle || undefined;
  const ogImage = company.ogImageUrl || company.heroImageUrl || undefined;
  const canonical = company.canonicalUrl || `${SITE_URL}/empresas/${company.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      modifiedTime: company.updatedAt.toISOString(),
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: { index: !company.noIndex, follow: !company.noIndex },
  };
}

function renderHeroTitle(heroTitle: string, highlight: string | null) {
  if (!highlight || !heroTitle.includes(highlight)) return heroTitle;
  const [before, after] = heroTitle.split(highlight);
  return (
    <>
      {before}
      <span className="text-primary">{highlight}</span>
      {after}
    </>
  );
}

export default async function CompanyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) notFound();

  const aboutImages = company.images.filter((img) => img.section === "ABOUT");
  const galleryImages = company.images.filter((img) => img.section === "GALLERY");

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Empresas", item: `${SITE_URL}/empresas` },
      { "@type": "ListItem", position: 3, name: company.name, item: `${SITE_URL}/empresas/${company.slug}` },
    ],
  };

  return (
    <article className="pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Hero — título a la izquierda, foto a la derecha con degradado (desktop) */}
      <header className="relative overflow-hidden border-b border-border bg-white">
        <div
          className={`relative ${company.heroImageUrl ? "lg:min-h-[440px]" : ""} flex items-center`}
        >
          {company.heroImageUrl && (
            <div className="hidden lg:block absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={company.heroImageUrl} alt={company.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-r from-white via-white/85 to-white/10" />
            </div>
          )}

          <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700">
            <div className="max-w-xl">
              <Link
                href="/empresas"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary mb-5"
              >
                <ArrowLeft className="size-3.5" />
                Volver a empresas
              </Link>

              <div className="flex items-center gap-3 mb-4">
                {company.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt={`Logo de ${company.name}`}
                    className="h-9 w-auto object-contain shrink-0"
                  />
                )}
                {company.sector && (
                  <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                    {company.sector}
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-foreground leading-[1.15]">
                {renderHeroTitle(company.heroTitle, company.heroHighlight)}
              </h1>

              {company.heroSubtitle && (
                <>
                  <div className="w-10 h-1 bg-primary my-5" />
                  <p className="text-base text-muted-foreground leading-relaxed">{company.heroSubtitle}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: la foto va debajo, sin degradado */}
        {company.heroImageUrl && (
          <div className="lg:hidden px-4 sm:px-6 pb-8 -mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.heroImageUrl}
              alt={company.name}
              className="w-full aspect-video object-cover rounded-2xl border border-border shadow-sm"
            />
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 mt-12">
        {/* ¿Quién es? */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">¿Quién es {company.name}?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div
                className="prose-blog"
                dangerouslySetInnerHTML={{ __html: company.aboutContent }}
              />
              {company.fullAddress && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-primary shrink-0" />
                  {company.fullAddress}
                </div>
              )}
            </div>

            {company.facts.length > 0 && (
              <div className="space-y-3">
                {company.facts.map((fact) => {
                  const Icon = getCompanyIcon(fact.icon);
                  return (
                    <div key={fact.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{fact.label}</p>
                        {fact.value && <p className="text-xs text-muted-foreground mt-0.5">{fact.value}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {aboutImages.length > 0 && (
            <div className="mt-8">
              <ImageCarousel images={aboutImages} />
            </div>
          )}
        </section>

        {/* El reto / Compromiso / Trabajo en equipo */}
        {(company.challengeText || company.leadershipText || company.teamworkText) && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {company.challengeText && (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="size-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">El reto</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{company.challengeText}</p>
                {company.challengeImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.challengeImageUrl}
                    alt="El reto"
                    className="w-full aspect-4/3 object-cover rounded-lg border border-border"
                  />
                )}
              </div>
            )}
            {company.leadershipText && (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="size-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Compromiso de la Alta Dirección</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{company.leadershipText}</p>
                {company.leadershipImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.leadershipImageUrl}
                    alt="Compromiso de la Alta Dirección"
                    className="w-full aspect-4/3 object-cover rounded-lg border border-border"
                  />
                )}
              </div>
            )}
            {company.teamworkText && (
              <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="size-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Trabajo en equipo</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{company.teamworkText}</p>
                {company.teamworkImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.teamworkImageUrl}
                    alt="Trabajo en equipo"
                    className="w-full aspect-4/3 object-cover rounded-lg border border-border"
                  />
                )}
              </div>
            )}
          </section>
        )}

        {/* Sus servicios */}
        {company.services.length > 0 && (
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Sus servicios</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.services.map((service) => (
                <div key={service.id} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-sm font-semibold text-foreground">{service.title}</h3>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{service.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Proceso de Implementación — fijo, igual para todas las empresas */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8 text-center">
            Proceso de Implementación
          </h2>
          <div className="overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="relative flex items-start justify-between gap-4">
              <div className="absolute left-12 right-12 top-7 h-px bg-border" aria-hidden="true" />
              {IMPLEMENTATION_STEPS.map(({ label, Icon }) => (
                <div key={label} className="relative z-10 flex flex-col items-center gap-2 w-24 text-center shrink-0">
                  <div className="size-14 rounded-full bg-background">
                    <div className="size-full rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="size-6 text-primary" />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-foreground leading-snug">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Normas certificadas */}
        {company.certifications.length > 0 && (
          <section className="rounded-2xl bg-foreground text-background p-8 sm:p-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Un Sistema de Gestión alineado con estándares internacionales
            </h2>
            <p className="text-background/70 text-sm mb-6 max-w-2xl">
              Normas y estándares certificados en este proyecto.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {company.certifications.map((cert) => {
                const Icon = getCompanyIcon(cert.icon);
                return (
                  <div key={cert.id} className="flex flex-col items-center text-center gap-2 rounded-xl bg-background/10 p-4">
                    <Icon className="size-6 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{cert.standard}</p>
                      <p className="text-xs text-background/60">{cert.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Mejoras alcanzadas */}
        {company.achievements.length > 0 && (
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Principales mejoras alcanzadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {company.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-2.5 rounded-lg border border-border bg-card p-4">
                  <BadgeCheck className="size-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{achievement.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reconocimientos */}
        {company.awards.length > 0 && (
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Reconocimientos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.awards.map((award) => (
                <div key={award.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  {award.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={award.imageUrl} alt={award.title} className="w-full aspect-video object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-foreground">{award.title}</h3>
                    {award.description && (
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{award.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Momentos del proyecto */}
        {galleryImages.length > 0 && (
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Momentos del proyecto</h2>
            <CompanyGallery images={galleryImages} />
          </section>
        )}

        {/* Testimonio */}
        {company.testimonialVimeoId && (
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Testimonio</h2>
            <TestimonialVideo
              vimeoId={company.testimonialVimeoId}
              title={`Testimonio de ${company.name}`}
              quote={company.testimonialQuote}
              authorName={company.testimonialAuthorName}
              authorRole={company.testimonialAuthorRole}
            />
          </section>
        )}

        {/* Ficha del Proyecto */}
        {(company.fichaLocation ||
          company.fichaClientName ||
          company.fichaRuc ||
          company.fichaProjectScope ||
          company.fichaCertificationYear ||
          company.fichaProjectStatus ||
          company.fichaAccompaniment) && (
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <ClipboardList className="size-5 text-primary" /> Ficha del Proyecto
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {company.fichaClientName && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cliente</dt>
                  <dd className="text-foreground mt-0.5">{company.fichaClientName}</dd>
                </div>
              )}
              {company.fichaRuc && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">RUC</dt>
                  <dd className="text-foreground mt-0.5">{company.fichaRuc}</dd>
                </div>
              )}
              {company.fichaLocation && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ubicación</dt>
                  <dd className="text-foreground mt-0.5">{company.fichaLocation}</dd>
                </div>
              )}
              {company.fichaCertificationYear && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Año de certificación
                  </dt>
                  <dd className="text-foreground mt-0.5">{company.fichaCertificationYear}</dd>
                </div>
              )}
              {company.fichaProjectStatus && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estado</dt>
                  <dd className="text-foreground mt-0.5">{company.fichaProjectStatus}</dd>
                </div>
              )}
              {company.fichaAccompaniment && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Acompañamiento
                  </dt>
                  <dd className="text-foreground mt-0.5">{company.fichaAccompaniment}</dd>
                </div>
              )}
              {company.fichaProjectScope && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Alcance / Proyecto
                  </dt>
                  <dd className="text-foreground mt-0.5">{company.fichaProjectScope}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Cierre institucional */}
        {company.closingMessage && (
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start">
            {company.closingImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.closingImageUrl}
                alt={`Reconocimiento a ${company.name}`}
                className="w-full sm:w-56 aspect-4/3 object-cover rounded-xl border border-border shrink-0"
              />
            )}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="size-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">Reconocimiento Institucional</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {company.closingMessage}
              </p>
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
