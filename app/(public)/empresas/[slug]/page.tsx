import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BadgeCheck, MapPin, Megaphone, ShieldCheck, Target, Users } from "lucide-react";
import { getCompanyBySlug } from "@/lib/queries/empresas";
import { getCompanyIcon } from "@/lib/empresas/icons";
import { splitHighlight } from "@/lib/empresas/highlight";
import { CompanyGallery } from "@/components/public/CompanyGallery";
import { ImageCarousel } from "@/components/public/ImageCarousel";
import { TestimonialVideo } from "@/components/public/TestimonialVideo";
import { Eyebrow, SectionHeading } from "@/components/public/empresas/SectionHeading";
import { ProcessTimeline } from "@/components/public/empresas/ProcessTimeline";
import { ProjectFicha } from "@/components/public/empresas/ProjectFicha";
import { StoryCard } from "@/components/public/empresas/StoryCard";

type Params = Promise<{ slug: string }>;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

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
  const parts = splitHighlight(heroTitle, highlight);
  if (!parts) return heroTitle;
  return (
    <>
      {parts.before}
      <span className="text-primary">{parts.match}</span>
      {parts.after}
    </>
  );
}

export default async function CompanyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) notFound();

  const aboutImages = company.images.filter((img) => img.section === "ABOUT");
  const galleryImages = company.images.filter((img) => img.section === "GALLERY");
  const standards = company.certifications.map((cert) => cert.standard);

  const heroMeta = [
    { label: "Sector", value: company.sector },
    { label: "Ubicación", value: company.fichaLocation },
    { label: "Certificación", value: company.fichaCertificationYear },
    { label: "Normas", value: standards.length > 0 ? standards.join(" · ") : null },
  ].filter((item) => Boolean(item.value));

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
    <article className="bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── Portada del expediente ─────────────────────────────────────── */}
      <header className="emp-grain relative flex min-h-[38rem] flex-col justify-end overflow-hidden bg-foreground text-background lg:min-h-[44rem]">
        {company.heroImageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.heroImageUrl}
              alt={company.name}
              className="absolute inset-0 size-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-linear-to-t from-foreground via-foreground/85 to-foreground/40" />
          </>
        ) : (
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-32 size-[36rem] rounded-full bg-primary/20 blur-[130px]"
          />
        )}

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-12 lg:pt-20">
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-700">
            <Link
              href="/empresas"
              className="font-semibold group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-background/55 transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
              Empresas
            </Link>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              {company.logoUrl && (
                <span className="flex h-14 items-center bg-background px-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.logoUrl}
                    alt={`Logo de ${company.name}`}
                    className="max-h-9 w-auto object-contain"
                  />
                </span>
              )}
              <div>
                <p className="font-black text-2xl leading-none tracking-tight text-background sm:text-3xl">
                  {company.name}
                </p>
                {company.sector && (
                  <p className="font-semibold mt-2 text-[11px] uppercase tracking-[0.24em] text-primary">
                    {company.sector}
                  </p>
                )}
              </div>
            </div>

            <h1 className="font-black mt-8 max-w-4xl text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              {renderHeroTitle(company.heroTitle, company.heroHighlight)}
            </h1>

            {company.heroSubtitle && (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-background/65">{company.heroSubtitle}</p>
            )}
          </div>

          {heroMeta.length > 0 && (
            <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-background/15 pt-6 lg:grid-cols-4">
              {heroMeta.map((item) => (
                <div key={item.label}>
                  <dt className="font-semibold text-[10px] uppercase tracking-[0.24em] text-background/40">
                    {item.label}
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-background">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </header>

      {/* ── Perfil ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-20 sm:px-6 sm:pb-16 sm:pt-24 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="Perfil" title={`¿Quién es ${company.name}?`} />
            <div
              className="prose-blog emp-lead mt-8"
              dangerouslySetInnerHTML={{ __html: company.aboutContent }}
            />
            {company.fullAddress && (
              <p className="mt-8 flex items-start gap-2.5 border-t border-border pt-5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {company.fullAddress}
              </p>
            )}
          </div>

          {company.facts.length > 0 && (
            <aside className="lg:col-span-4 lg:col-start-9">
              <div className="lg:sticky lg:top-28">
                <Eyebrow>En cifras</Eyebrow>
                <dl className="mt-6 border-t border-border">
                  {company.facts.map((fact) => {
                    const Icon = getCompanyIcon(fact.icon);
                    return (
                      <div key={fact.id} className="flex items-start gap-4 border-b border-border py-5">
                        <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                        <div>
                          <dt className="text-sm font-semibold leading-snug text-foreground">{fact.label}</dt>
                          {fact.value && (
                            <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{fact.value}</dd>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </aside>
          )}
        </div>

        {aboutImages.length > 0 && (
          <div className="mt-10">
            <ImageCarousel images={aboutImages} />
          </div>
        )}
      </section>

      {/* ── El reto / Alta Dirección / Trabajo en equipo ────────────────── */}
      {(company.challengeText || company.leadershipText || company.teamworkText) && (
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-6 px-4 py-20 sm:px-6 sm:py-24 md:grid-cols-3 lg:gap-8 lg:px-8">
            {company.challengeText && (
              <StoryCard
                title="El reto"
                text={company.challengeText}
                imageUrl={company.challengeImageUrl}
                Icon={Target}
              />
            )}
            {company.leadershipText && (
              <StoryCard
                title="Compromiso de la Alta Dirección"
                text={company.leadershipText}
                imageUrl={company.leadershipImageUrl}
                Icon={ShieldCheck}
              />
            )}
            {company.teamworkText && (
              <StoryCard
                title="Trabajo en equipo"
                text={company.teamworkText}
                imageUrl={company.teamworkImageUrl}
                Icon={Users}
              />
            )}
          </div>
        </section>
      )}

      {/* ── Servicios de la empresa ─────────────────────────────────────── */}
      {company.services.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading eyebrow="Actividad" title="Sus servicios" />
          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
            {company.services.map((service) => (
              <div key={service.id} className="border-t-2 border-border py-6">
                <h3 className="text-base font-semibold leading-snug text-foreground">{service.title}</h3>
                {service.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Proceso de implementación (bloque estructural fijo) ─────────── */}
      <ProcessTimeline />

      {/* ── Normas certificadas ────────────────────────────────────────── */}
      {company.certifications.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading
            eyebrow="Estándares"
            title={
              <>
                Un sistema alineado con estándares <span className="text-primary">internacionales</span>
              </>
            }
            lead="Normas certificadas dentro del alcance de este proyecto."
          />

          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
            {company.certifications.map((cert) => {
              const Icon = getCompanyIcon(cert.icon);
              return (
                <div
                  key={cert.id}
                  className="group flex items-start gap-5 border-t border-foreground py-7 transition-colors duration-300 hover:border-primary"
                >
                  <Icon
                    className="mt-1 size-6 shrink-0 text-primary transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-black text-2xl leading-none tracking-tight text-foreground">
                      {cert.standard}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{cert.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Mejoras alcanzadas ─────────────────────────────────────────── */}
      {company.achievements.length > 0 && (
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <SectionHeading eyebrow="Resultados" title="Principales mejoras alcanzadas" />
            <ul className="mt-12 grid grid-cols-1 gap-x-14 lg:grid-cols-2">
              {company.achievements.map((achievement) => (
                <li key={achievement.id} className="flex items-start gap-4 border-b border-border py-6">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-base leading-relaxed text-foreground">{achievement.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Reconocimientos ────────────────────────────────────────────── */}
      {company.awards.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading eyebrow="Distinciones" title="Reconocimientos" />
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {company.awards.map((award) => (
              <article key={award.id} className="group">
                {award.imageUrl && (
                  <div className="overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={award.imageUrl}
                      alt={award.title}
                      loading="lazy"
                      className="aspect-4/3 w-full object-cover grayscale-[35%] transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                    />
                  </div>
                )}
                <div className="border-t-2 border-foreground pt-5">
                  <h3 className="text-base font-semibold leading-snug text-foreground">{award.title}</h3>
                  {award.description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{award.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Momentos del proyecto ──────────────────────────────────────── */}
      {galleryImages.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <SectionHeading eyebrow="Archivo" title="Momentos del proyecto" />
          <div className="mt-12">
            <CompanyGallery images={galleryImages} />
          </div>
        </section>
      )}

      {/* ── Testimonio ─────────────────────────────────────────────────── */}
      {company.testimonialVimeoId && (
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <SectionHeading eyebrow="En sus palabras" title="Testimonio" />
            <div className="mt-12">
              <TestimonialVideo
                vimeoId={company.testimonialVimeoId}
                title={`Testimonio de ${company.name}`}
                quote={company.testimonialQuote}
                authorName={company.testimonialAuthorName}
                authorRole={company.testimonialAuthorRole}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Ficha del proyecto + cierre institucional ───────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className={company.closingMessage ? "lg:col-span-7" : "lg:col-span-12"}>
            <ProjectFicha
              standards={standards}
              fields={[
                { label: "Cliente", value: company.fichaClientName },
                { label: "RUC", value: company.fichaRuc },
                { label: "Ubicación", value: company.fichaLocation },
                { label: "Año de certificación", value: company.fichaCertificationYear },
                { label: "Estado", value: company.fichaProjectStatus },
                { label: "Acompañamiento", value: company.fichaAccompaniment },
                { label: "Alcance del proyecto", value: company.fichaProjectScope, wide: true },
              ]}
            />
          </div>

          {company.closingMessage && (
            <div className="lg:col-span-5">
              <div className="h-full rounded-2xl border border-primary/20 bg-primary/5 p-7 sm:p-9">
                <Eyebrow>
                  <span className="inline-flex items-center gap-2">
                    <Megaphone className="size-3.5 text-primary" aria-hidden="true" />
                    Reconocimiento institucional
                  </span>
                </Eyebrow>

                {company.closingImageUrl && (
                  <div className="mt-7 overflow-hidden rounded-xl border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={company.closingImageUrl}
                      alt={`Reconocimiento a ${company.name}`}
                      loading="lazy"
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                )}

                <p className="mt-7 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {company.closingMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Cierre / navegación ────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <p className="font-black max-w-xl text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
            ¿Quieres un proyecto como el de <span className="text-primary">{company.name}</span>?
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/servicios"
              className="font-semibold group inline-flex items-center gap-3 bg-primary px-7 py-4 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-foreground"
            >
              Ver servicios
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/empresas"
              className="font-semibold inline-flex items-center gap-3 border border-border px-7 py-4 text-[11px] uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground"
            >
              Otros casos
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
