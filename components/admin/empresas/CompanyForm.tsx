"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Eye,
  Calendar,
  Building2,
  ImageIcon,
  Search,
  Globe2,
  Hash,
  ExternalLink,
  MapPin,
  Sparkles,
  ListChecks,
  Trophy,
  ShieldCheck,
  GalleryHorizontal,
  Quote,
  ClipboardList,
  Megaphone,
  BookOpen,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { RichTextEditor } from "@/components/admin/blog/RichTextEditor";
import { RepeaterField } from "@/components/admin/empresas/RepeaterField";
import { IconSelect } from "@/components/admin/empresas/IconSelect";
import { CompanyIcon } from "@/components/admin/empresas/CompanyIcon";
import { splitHighlight } from "@/lib/empresas/highlight";
import {
  POST_STATUSES,
  POST_STATUS_LABELS,
  type PostStatusValue,
} from "@/lib/validations/empresas";
import { toSlug } from "@/lib/empresas/slug-client";

type ActionState = { error?: string; success?: boolean } | null;
type CompanyAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

type FactItem = { icon: string; label: string; value: string };
type ServiceItem = { title: string; description: string };
type AchievementItem = { text: string };
type AwardItem = { title: string; description: string; imageUrl: string };
type CertificationItem = { standard: string; label: string; icon: string };
type ImageItem = { url: string; alt: string; caption: string };

export type CompanyFormValues = {
  id?: string;
  name?: string;
  slug?: string;
  sector?: string | null;
  logoUrl?: string | null;
  status?: PostStatusValue;
  publishedAt?: Date | null;
  heroTitle?: string;
  heroHighlight?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  aboutContent?: string;
  fullAddress?: string | null;
  challengeText?: string | null;
  challengeImageUrl?: string | null;
  leadershipText?: string | null;
  leadershipImageUrl?: string | null;
  teamworkText?: string | null;
  teamworkImageUrl?: string | null;
  testimonialVimeoId?: string | null;
  testimonialQuote?: string | null;
  testimonialAuthorName?: string | null;
  testimonialAuthorRole?: string | null;
  fichaLocation?: string | null;
  fichaClientName?: string | null;
  fichaRuc?: string | null;
  fichaProjectScope?: string | null;
  fichaCertificationYear?: string | null;
  fichaProjectStatus?: string | null;
  fichaAccompaniment?: string | null;
  closingMessage?: string | null;
  closingImageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  facts?: { icon: string; label: string; value: string | null }[];
  services?: { title: string; description: string | null }[];
  achievements?: { text: string }[];
  awards?: { title: string; description: string | null; imageUrl: string | null }[];
  certifications?: { standard: string; label: string; icon: string | null }[];
  images?: { section: "ABOUT" | "GALLERY"; url: string; alt: string; caption: string | null }[];
};

type Props = {
  action: CompanyAction;
  company?: CompanyFormValues;
};

const sectionCardClassName = "space-y-5 rounded-xl border border-border/70 bg-card p-5 md:p-6";
const fieldLabelClassName = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const controlClassName = "h-11 rounded-lg border-border/80 bg-background text-sm";

function toLocalDateTimeInput(date?: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

/** Campo con etiqueta propia dentro de un repetidor, para que cada casilla se entienda sin adivinar. */
function MiniField({
  htmlFor,
  label,
  hint,
  children,
}: {
  htmlFor: string;
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-[11px] font-semibold text-foreground">
        {label}
      </Label>
      {children}
      <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>
    </div>
  );
}

/** Marco de "así se verá en la landing", para los repetidores con ícono. */
function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Así se verá en la landing
      </p>
      {children}
    </div>
  );
}

function FactPreview({ icon, label, value }: FactItem) {
  return (
    <PreviewFrame>
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 max-w-xs">
        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <CompanyIcon name={icon} className="size-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{label || "Título del dato"}</p>
          {value && <p className="text-xs text-muted-foreground mt-0.5 truncate">{value}</p>}
        </div>
      </div>
    </PreviewFrame>
  );
}

function CertificationPreview({ standard, label, icon }: CertificationItem) {
  return (
    <PreviewFrame>
      <div className="rounded-xl bg-foreground p-4 max-w-[10rem]">
        <div className="flex flex-col items-center text-center gap-2 rounded-xl bg-background/10 p-4">
          <CompanyIcon name={icon} className="size-6 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-background truncate">{standard || "ISO 9001:2015"}</p>
            <p className="text-xs text-background/60 truncate">{label || "Calidad"}</p>
          </div>
        </div>
      </div>
    </PreviewFrame>
  );
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export function CompanyForm({ action, company }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  const [name, setName] = useState(company?.name ?? "");
  const [slug, setSlug] = useState(company?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(company?.slug));
  const [sector, setSector] = useState(company?.sector ?? "");
  const [logoUrl, setLogoUrl] = useState(company?.logoUrl ?? "");
  const [status, setStatus] = useState<PostStatusValue>(company?.status ?? "DRAFT");
  const [publishedAt, setPublishedAt] = useState<string>(toLocalDateTimeInput(company?.publishedAt));

  const [heroTitle, setHeroTitle] = useState(company?.heroTitle ?? "");
  const [heroHighlight, setHeroHighlight] = useState(company?.heroHighlight ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(company?.heroSubtitle ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(company?.heroImageUrl ?? "");

  const [aboutContent, setAboutContent] = useState(company?.aboutContent ?? "");
  const [fullAddress, setFullAddress] = useState(company?.fullAddress ?? "");

  const [challengeText, setChallengeText] = useState(company?.challengeText ?? "");
  const [challengeImageUrl, setChallengeImageUrl] = useState(company?.challengeImageUrl ?? "");
  const [leadershipText, setLeadershipText] = useState(company?.leadershipText ?? "");
  const [leadershipImageUrl, setLeadershipImageUrl] = useState(company?.leadershipImageUrl ?? "");
  const [teamworkText, setTeamworkText] = useState(company?.teamworkText ?? "");
  const [teamworkImageUrl, setTeamworkImageUrl] = useState(company?.teamworkImageUrl ?? "");

  const [testimonialVimeoId, setTestimonialVimeoId] = useState(company?.testimonialVimeoId ?? "");
  const [testimonialQuote, setTestimonialQuote] = useState(company?.testimonialQuote ?? "");
  const [testimonialAuthorName, setTestimonialAuthorName] = useState(company?.testimonialAuthorName ?? "");
  const [testimonialAuthorRole, setTestimonialAuthorRole] = useState(company?.testimonialAuthorRole ?? "");

  const [fichaLocation, setFichaLocation] = useState(company?.fichaLocation ?? "");
  const [fichaClientName, setFichaClientName] = useState(company?.fichaClientName ?? "");
  const [fichaRuc, setFichaRuc] = useState(company?.fichaRuc ?? "");
  const [fichaProjectScope, setFichaProjectScope] = useState(company?.fichaProjectScope ?? "");
  const [fichaCertificationYear, setFichaCertificationYear] = useState(company?.fichaCertificationYear ?? "");
  const [fichaProjectStatus, setFichaProjectStatus] = useState(company?.fichaProjectStatus ?? "");
  const [fichaAccompaniment, setFichaAccompaniment] = useState(company?.fichaAccompaniment ?? "");

  const [closingMessage, setClosingMessage] = useState(company?.closingMessage ?? "");
  const [closingImageUrl, setClosingImageUrl] = useState(company?.closingImageUrl ?? "");

  const [seoTitle, setSeoTitle] = useState(company?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(company?.seoDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(company?.ogImageUrl ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(company?.canonicalUrl ?? "");
  const [noIndex, setNoIndex] = useState(company?.noIndex ?? false);

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success("Cambios guardados correctamente");
  }, [state]);

  const onNameBlur = () => {
    if (!slugManuallyEdited && name.trim()) {
      setSlug(toSlug(name));
    }
  };

  const onSlugChange = (value: string) => {
    setSlug(value);
    setSlugManuallyEdited(value.length > 0);
  };

  // Mismo cálculo que usa la landing, para avisar en el acto si la frase no coincide.
  const heroHighlightParts = useMemo(
    () => splitHighlight(heroTitle, heroHighlight),
    [heroTitle, heroHighlight],
  );

  const submitLabel = useMemo(() => {
    if (pending) return "Guardando…";
    switch (status) {
      case "PUBLISHED":
        return company ? "Guardar y publicar" : "Publicar";
      case "SCHEDULED":
        return "Programar publicación";
      case "ARCHIVED":
        return "Guardar y archivar";
      default:
        return company ? "Guardar borrador" : "Crear borrador";
    }
  }, [status, pending, company]);

  const factsInitial: FactItem[] = (company?.facts ?? []).map((f) => ({
    icon: f.icon,
    label: f.label,
    value: f.value ?? "",
  }));
  const servicesInitial: ServiceItem[] = (company?.services ?? []).map((s) => ({
    title: s.title,
    description: s.description ?? "",
  }));
  const achievementsInitial: AchievementItem[] = (company?.achievements ?? []).map((a) => ({ text: a.text }));
  const awardsInitial: AwardItem[] = (company?.awards ?? []).map((a) => ({
    title: a.title,
    description: a.description ?? "",
    imageUrl: a.imageUrl ?? "",
  }));
  const certificationsInitial: CertificationItem[] = (company?.certifications ?? []).map((c) => ({
    standard: c.standard,
    label: c.label,
    icon: c.icon ?? "",
  }));
  const aboutImagesInitial: ImageItem[] = (company?.images ?? [])
    .filter((img) => img.section === "ABOUT")
    .map((img) => ({ url: img.url, alt: img.alt, caption: img.caption ?? "" }));
  const galleryImagesInitial: ImageItem[] = (company?.images ?? [])
    .filter((img) => img.section === "GALLERY")
    .map((img) => ({ url: img.url, alt: img.alt, caption: img.caption ?? "" }));

  return (
    <form action={formAction} className="space-y-8">
      {company?.id && <input type="hidden" name="id" value={company.id} />}
      <input type="hidden" name="sector" value={sector} />
      <input type="hidden" name="logoUrl" value={logoUrl} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="publishedAt" value={publishedAt} />
      <input type="hidden" name="heroHighlight" value={heroHighlight} />
      <input type="hidden" name="heroImageUrl" value={heroImageUrl} />
      <input type="hidden" name="aboutContent" value={aboutContent} />
      <input type="hidden" name="challengeImageUrl" value={challengeImageUrl} />
      <input type="hidden" name="leadershipImageUrl" value={leadershipImageUrl} />
      <input type="hidden" name="teamworkImageUrl" value={teamworkImageUrl} />
      <input type="hidden" name="closingImageUrl" value={closingImageUrl} />
      <input type="hidden" name="ogImageUrl" value={ogImageUrl} />
      <input type="hidden" name="noIndex" value={noIndex ? "true" : "false"} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Columna principal ───────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="general">
            <TabsList className="h-11 bg-muted/70 p-1 flex-wrap">
              <TabsTrigger value="general" className="px-4 gap-2">
                <Building2 className="size-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="historia" className="px-4 gap-2">
                <BookOpen className="size-4" />
                Historia
              </TabsTrigger>
              <TabsTrigger value="resultados" className="px-4 gap-2">
                <Trophy className="size-4" />
                Resultados
              </TabsTrigger>
              <TabsTrigger value="testimonio" className="px-4 gap-2">
                <Quote className="size-4" />
                Testimonio y ficha
              </TabsTrigger>
              <TabsTrigger value="seo" className="px-4 gap-2">
                <Search className="size-4" />
                SEO
              </TabsTrigger>
            </TabsList>

          <TabsContent value="general" keepMounted className="space-y-6 mt-6">
          {/* Identidad */}
          <section className={sectionCardClassName}>
            <SectionHeader icon={Building2} title="Identidad de la empresa" description="Nombre, slug, rubro y logo." />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={fieldLabelClassName}>
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={onNameBlur}
                  placeholder="Ej. Grupo de Salud y Seguridad CISS"
                  className="h-12 text-lg font-semibold rounded-lg border-border/80 bg-background"
                  maxLength={140}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
                  <Hash className="size-3.5" /> Slug
                  <Badge variant="outline" className="ml-2 text-[10px] font-normal py-0">
                    {slugManuallyEdited ? "manual" : "auto"}
                  </Badge>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">/empresas/</span>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => onSlugChange(e.target.value)}
                    placeholder="mi-empresa"
                    className={controlClassName}
                    maxLength={160}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector" className={fieldLabelClassName}>
                    Rubro
                  </Label>
                  <Input
                    id="sector"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="Ej. Salud Ocupacional"
                    className={controlClassName}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={fieldLabelClassName}>Logo</Label>
                  <CloudinaryUpload
                    value={logoUrl}
                    onChange={setLogoUrl}
                    resourceType="image"
                    label="Subir logo"
                    folder="lms/empresas/logos"
                    compact
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Hero */}
          <section className={sectionCardClassName}>
            <SectionHeader icon={Sparkles} title="Hero" description="Titular, subtítulo e imagen principal de la landing." />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle" className={fieldLabelClassName}>
                  Título del hero <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="heroTitle"
                  name="heroTitle"
                  required
                  rows={2}
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Grupo CISS fortalece su gestión con altos estándares en salud ocupacional"
                  className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroHighlight" className={fieldLabelClassName}>
                  Frase a resaltar en rojo
                </Label>
                <Input
                  id="heroHighlight"
                  value={heroHighlight}
                  onChange={(e) => setHeroHighlight(e.target.value)}
                  placeholder="salud ocupacional"
                  className={controlClassName}
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground">
                  Debe ser un fragmento del título de arriba; se resalta con el rojo de RIVISIG. No importan
                  las mayúsculas ni las tildes.
                </p>
                {heroHighlight.trim() &&
                  (heroHighlightParts ? (
                    <p className="text-sm text-foreground">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-2">
                        Vista previa
                      </span>
                      {heroHighlightParts.before}
                      <span className="text-primary font-semibold">{heroHighlightParts.match}</span>
                      {heroHighlightParts.after}
                    </p>
                  ) : (
                    <p className="text-xs text-destructive">
                      Esa frase no aparece en el título, así que no se resaltará nada. Cópiala del título de
                      arriba.
                    </p>
                  ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="heroSubtitle" className={fieldLabelClassName}>
                  Subtítulo
                </Label>
                <Textarea
                  id="heroSubtitle"
                  name="heroSubtitle"
                  rows={2}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  maxLength={400}
                />
              </div>

              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Imagen del hero</Label>
                <CloudinaryUpload
                  value={heroImageUrl}
                  onChange={setHeroImageUrl}
                  resourceType="image"
                  label="Subir imagen de hero"
                  folder="lms/empresas/hero"
                />
              </div>
            </div>
          </section>

          </TabsContent>

          <TabsContent value="historia" keepMounted className="space-y-6 mt-6">
          {/* ¿Quién es? */}
          <section className={sectionCardClassName}>
            <SectionHeader icon={Building2} title="¿Quién es la empresa?" description="Descripción, dirección, datos rápidos e imágenes." />

            <div className="space-y-4">
              <RichTextEditor value={aboutContent} onChange={setAboutContent} placeholder="Describe a la empresa…" />

              <div className="space-y-2">
                <Label htmlFor="fullAddress" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
                  <MapPin className="size-3.5" /> Dirección
                </Label>
                <Input
                  id="fullAddress"
                  name="fullAddress"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className={controlClassName}
                  maxLength={240}
                />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className={fieldLabelClassName}>Datos rápidos</Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tarjetitas que aparecen a la derecha del bloque «¿Quién es {name || "la empresa"}?» en la
                    landing. Resumen la empresa de un vistazo: especialidad, años de experiencia, tamaño del
                    equipo, sedes… Cada dato tiene un ícono, un título en negrita y un detalle opcional debajo.
                  </p>
                </div>
                <RepeaterField<FactItem>
                  name="facts"
                  items={factsInitial}
                  emptyItem={{ icon: "shield", label: "", value: "" }}
                  addLabel="Agregar dato"
                  emptyMessage="Sin datos rápidos aún."
                  renderItem={(item, i, update) => (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_minmax(0,1fr)] gap-3">
                        <MiniField
                          htmlFor={`fact-icon-${i}`}
                          label="Ícono"
                          hint="Dibujo que va en el cuadrito rojo."
                        >
                          <IconSelect
                            id={`fact-icon-${i}`}
                            value={item.icon}
                            onChange={(icon) => update({ icon })}
                            className={`${controlClassName} w-full`}
                          />
                        </MiniField>
                        <MiniField
                          htmlFor={`fact-label-${i}`}
                          label="Título del dato"
                          hint="Texto en negrita. Ej.: «Especialidad»."
                        >
                          <Input
                            id={`fact-label-${i}`}
                            value={item.label}
                            onChange={(e) => update({ label: e.target.value })}
                            placeholder="Especialidad"
                            className={controlClassName}
                          />
                        </MiniField>
                        <MiniField
                          htmlFor={`fact-value-${i}`}
                          label="Detalle (opcional)"
                          hint="Línea gris debajo del título. Ej.: «Salud ocupacional»."
                        >
                          <Input
                            id={`fact-value-${i}`}
                            value={item.value}
                            onChange={(e) => update({ value: e.target.value })}
                            placeholder="Salud ocupacional"
                            className={controlClassName}
                          />
                        </MiniField>
                      </div>
                      <FactPreview {...item} />
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Imágenes (fachada, instalaciones…)</Label>
                <RepeaterField<ImageItem>
                  name="aboutImages"
                  items={aboutImagesInitial}
                  emptyItem={{ url: "", alt: "", caption: "" }}
                  addLabel="Agregar imagen"
                  emptyMessage="Sin imágenes aún."
                  renderItem={(item, _i, update) => (
                    <div className="flex items-center gap-3">
                      <CloudinaryUpload
                        value={item.url}
                        onChange={(url) => update({ url })}
                        resourceType="image"
                        label="Subir"
                        folder="lms/empresas/about"
                        layout="row"
                      />
                      <Input
                        value={item.alt}
                        onChange={(e) => update({ alt: e.target.value })}
                        placeholder="Texto alternativo"
                        className={`${controlClassName} flex-1`}
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </section>

          {/* El reto / Compromiso / Trabajo en equipo */}
          <section className={sectionCardClassName}>
            <SectionHeader
              icon={ClipboardList}
              title="El reto, compromiso de la Alta Dirección y trabajo en equipo"
              description="Los 3 bloques fijos de la landing."
            />

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className={fieldLabelClassName}>El reto</Label>
                <Textarea
                  value={challengeText}
                  onChange={(e) => setChallengeText(e.target.value)}
                  rows={3}
                  className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  maxLength={2000}
                />
                <input type="hidden" name="challengeText" value={challengeText} />
                <CloudinaryUpload
                  value={challengeImageUrl}
                  onChange={setChallengeImageUrl}
                  resourceType="image"
                  label="Subir imagen"
                  folder="lms/empresas/challenge"
                  compact
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Compromiso de la Alta Dirección</Label>
                <Textarea
                  value={leadershipText}
                  onChange={(e) => setLeadershipText(e.target.value)}
                  rows={3}
                  className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  maxLength={2000}
                />
                <input type="hidden" name="leadershipText" value={leadershipText} />
                <CloudinaryUpload
                  value={leadershipImageUrl}
                  onChange={setLeadershipImageUrl}
                  resourceType="image"
                  label="Subir imagen"
                  folder="lms/empresas/leadership"
                  compact
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className={fieldLabelClassName}>Trabajo en equipo</Label>
                <Textarea
                  value={teamworkText}
                  onChange={(e) => setTeamworkText(e.target.value)}
                  rows={3}
                  className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  maxLength={2000}
                />
                <input type="hidden" name="teamworkText" value={teamworkText} />
                <CloudinaryUpload
                  value={teamworkImageUrl}
                  onChange={setTeamworkImageUrl}
                  resourceType="image"
                  label="Subir imagen"
                  folder="lms/empresas/teamwork"
                  compact
                />
              </div>
            </div>
          </section>

          </TabsContent>

          <TabsContent value="resultados" keepMounted className="space-y-6 mt-6">
          {/* Servicios */}
          <section className={sectionCardClassName}>
            <SectionHeader icon={ListChecks} title="Sus servicios" description="Principales servicios o actividades de la empresa." />
            <RepeaterField<ServiceItem>
              name="services"
              items={servicesInitial}
              emptyItem={{ title: "", description: "" }}
              addLabel="Agregar servicio"
              emptyMessage="Sin servicios aún."
              renderItem={(item, _i, update) => (
                <div className="space-y-3">
                  <Input
                    value={item.title}
                    onChange={(e) => update({ title: e.target.value })}
                    placeholder="Título del servicio"
                    className={controlClassName}
                  />
                  <Textarea
                    value={item.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Descripción (opcional)"
                    rows={2}
                    className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  />
                </div>
              )}
            />
          </section>

          {/* Mejoras alcanzadas */}
          <section className={sectionCardClassName}>
            <SectionHeader icon={Trophy} title="Principales mejoras alcanzadas" description="Resultados e impacto del proyecto." />
            <RepeaterField<AchievementItem>
              name="achievements"
              items={achievementsInitial}
              emptyItem={{ text: "" }}
              addLabel="Agregar mejora"
              emptyMessage="Sin mejoras aún."
              renderItem={(item, _i, update) => (
                <Input
                  value={item.text}
                  onChange={(e) => update({ text: e.target.value })}
                  placeholder="Ej. Mejora en la comunicación interna y externa"
                  className={controlClassName}
                />
              )}
            />
          </section>

          {/* Reconocimientos */}
          <section className={sectionCardClassName}>
            <SectionHeader icon={Trophy} title="Reconocimientos" description="Premios, certificaciones o logros destacados (opcional)." />
            <RepeaterField<AwardItem>
              name="awards"
              items={awardsInitial}
              emptyItem={{ title: "", description: "", imageUrl: "" }}
              addLabel="Agregar reconocimiento"
              emptyMessage="Sin reconocimientos aún."
              renderItem={(item, _i, update) => (
                <div className="space-y-3">
                  <Input
                    value={item.title}
                    onChange={(e) => update({ title: e.target.value })}
                    placeholder="Título"
                    className={controlClassName}
                  />
                  <Textarea
                    value={item.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Descripción (opcional)"
                    rows={2}
                    className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  />
                  <CloudinaryUpload
                    value={item.imageUrl}
                    onChange={(url) => update({ imageUrl: url })}
                    resourceType="image"
                    label="Subir imagen"
                    folder="lms/empresas/awards"
                    layout="row"
                  />
                </div>
              )}
            />
          </section>

          {/* Normas certificadas */}
          <section className={sectionCardClassName}>
            <SectionHeader
              icon={ShieldCheck}
              title="Normas certificadas"
              description="Bloque oscuro «Un Sistema de Gestión alineado con estándares internacionales». Una tarjeta por norma."
            />
            <RepeaterField<CertificationItem>
              name="certifications"
              items={certificationsInitial}
              emptyItem={{ standard: "", label: "", icon: "shield" }}
              addLabel="Agregar norma"
              emptyMessage="Sin normas aún."
              renderItem={(item, i, update) => (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,12rem)] gap-3">
                    <MiniField
                      htmlFor={`cert-standard-${i}`}
                      label="Norma"
                      hint="Código y año, tal cual se certificó."
                    >
                      <Input
                        id={`cert-standard-${i}`}
                        value={item.standard}
                        onChange={(e) => update({ standard: e.target.value })}
                        placeholder="ISO 9001:2015"
                        className={controlClassName}
                      />
                    </MiniField>
                    <MiniField
                      htmlFor={`cert-label-${i}`}
                      label="Tema de la norma"
                      hint="De qué trata, en una o dos palabras. Ej.: «Calidad»."
                    >
                      <Input
                        id={`cert-label-${i}`}
                        value={item.label}
                        onChange={(e) => update({ label: e.target.value })}
                        placeholder="Calidad"
                        className={controlClassName}
                      />
                    </MiniField>
                    <MiniField
                      htmlFor={`cert-icon-${i}`}
                      label="Ícono"
                      hint="Dibujo sobre el nombre de la norma."
                    >
                      <IconSelect
                        id={`cert-icon-${i}`}
                        value={item.icon}
                        onChange={(icon) => update({ icon })}
                        className={`${controlClassName} w-full`}
                      />
                    </MiniField>
                  </div>
                  <CertificationPreview {...item} />
                </div>
              )}
            />
          </section>

          {/* Momentos del proyecto */}
          <section className={sectionCardClassName}>
            <SectionHeader icon={GalleryHorizontal} title="Momentos del proyecto" description="Galería de fotos del trabajo realizado." />
            <RepeaterField<ImageItem>
              name="galleryImages"
              items={galleryImagesInitial}
              emptyItem={{ url: "", alt: "", caption: "" }}
              addLabel="Agregar foto"
              emptyMessage="Sin fotos aún."
              renderItem={(item, _i, update) => (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CloudinaryUpload
                      value={item.url}
                      onChange={(url) => update({ url })}
                      resourceType="image"
                      label="Subir"
                      folder="lms/empresas/gallery"
                      layout="row"
                    />
                    <Input
                      value={item.alt}
                      onChange={(e) => update({ alt: e.target.value })}
                      placeholder="Texto alternativo"
                      className={`${controlClassName} flex-1`}
                    />
                  </div>
                  <Input
                    value={item.caption}
                    onChange={(e) => update({ caption: e.target.value })}
                    placeholder="Leyenda (opcional)"
                    className={controlClassName}
                  />
                </div>
              )}
            />
          </section>

          </TabsContent>

          <TabsContent value="testimonio" keepMounted className="space-y-6 mt-6">
          {/* Testimonio */}
          <section className={sectionCardClassName}>
            <SectionHeader icon={Quote} title="Testimonio" description="Bloque opcional: video de Vimeo + cita del representante." />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testimonialVimeoId" className={fieldLabelClassName}>
                  ID de video de Vimeo
                </Label>
                <Input
                  id="testimonialVimeoId"
                  name="testimonialVimeoId"
                  value={testimonialVimeoId}
                  onChange={(e) => setTestimonialVimeoId(e.target.value)}
                  placeholder="123456789"
                  className={controlClassName}
                />
                <p className="text-xs text-muted-foreground">Sólo el ID numérico del video, no la URL completa.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testimonialQuote" className={fieldLabelClassName}>
                  Cita
                </Label>
                <Textarea
                  id="testimonialQuote"
                  name="testimonialQuote"
                  rows={3}
                  value={testimonialQuote}
                  onChange={(e) => setTestimonialQuote(e.target.value)}
                  className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  maxLength={600}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="testimonialAuthorName" className={fieldLabelClassName}>
                    Nombre del representante
                  </Label>
                  <Input
                    id="testimonialAuthorName"
                    name="testimonialAuthorName"
                    value={testimonialAuthorName}
                    onChange={(e) => setTestimonialAuthorName(e.target.value)}
                    className={controlClassName}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testimonialAuthorRole" className={fieldLabelClassName}>
                    Cargo
                  </Label>
                  <Input
                    id="testimonialAuthorRole"
                    name="testimonialAuthorRole"
                    value={testimonialAuthorRole}
                    onChange={(e) => setTestimonialAuthorRole(e.target.value)}
                    className={controlClassName}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Ficha del Proyecto */}
          <section className={sectionCardClassName}>
            <SectionHeader icon={ClipboardList} title="Ficha del Proyecto" description="Datos estructurados que se muestran en el sidebar." />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fichaLocation" className={fieldLabelClassName}>
                  Ubicación
                </Label>
                <Input
                  id="fichaLocation"
                  name="fichaLocation"
                  value={fichaLocation}
                  onChange={(e) => setFichaLocation(e.target.value)}
                  placeholder="Lima, Perú"
                  className={controlClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fichaClientName" className={fieldLabelClassName}>
                  Cliente
                </Label>
                <Input
                  id="fichaClientName"
                  name="fichaClientName"
                  value={fichaClientName}
                  onChange={(e) => setFichaClientName(e.target.value)}
                  className={controlClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fichaRuc" className={fieldLabelClassName}>
                  RUC
                </Label>
                <Input
                  id="fichaRuc"
                  name="fichaRuc"
                  value={fichaRuc}
                  onChange={(e) => setFichaRuc(e.target.value)}
                  className={controlClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fichaCertificationYear" className={fieldLabelClassName}>
                  Año de certificación
                </Label>
                <Input
                  id="fichaCertificationYear"
                  name="fichaCertificationYear"
                  value={fichaCertificationYear}
                  onChange={(e) => setFichaCertificationYear(e.target.value)}
                  placeholder="2025"
                  className={controlClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fichaProjectStatus" className={fieldLabelClassName}>
                  Estado del proyecto
                </Label>
                <Input
                  id="fichaProjectStatus"
                  name="fichaProjectStatus"
                  value={fichaProjectStatus}
                  onChange={(e) => setFichaProjectStatus(e.target.value)}
                  placeholder="Sistema certificado"
                  className={controlClassName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fichaAccompaniment" className={fieldLabelClassName}>
                  Acompañamiento
                </Label>
                <Input
                  id="fichaAccompaniment"
                  name="fichaAccompaniment"
                  value={fichaAccompaniment}
                  onChange={(e) => setFichaAccompaniment(e.target.value)}
                  placeholder="RIVISIG Consultores"
                  className={controlClassName}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fichaProjectScope" className={fieldLabelClassName}>
                  Alcance / Proyecto
                </Label>
                <Textarea
                  id="fichaProjectScope"
                  name="fichaProjectScope"
                  rows={2}
                  value={fichaProjectScope}
                  onChange={(e) => setFichaProjectScope(e.target.value)}
                  className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  maxLength={400}
                />
              </div>
            </div>
          </section>

          {/* Cierre institucional */}
          <section className={sectionCardClassName}>
            <SectionHeader icon={Megaphone} title="Cierre institucional" description="Mensaje de reconocimiento de RIVISIG (opcional)." />
            <div className="space-y-4">
              <Textarea
                value={closingMessage}
                onChange={(e) => setClosingMessage(e.target.value)}
                rows={4}
                placeholder={`Desde RIVISIG Consultores expresamos nuestro reconocimiento a todo el equipo de ${name || "[Empresa]"}…`}
                className="resize-none rounded-lg border-border/80 bg-background text-sm"
                maxLength={1000}
              />
              <input type="hidden" name="closingMessage" value={closingMessage} />
              <CloudinaryUpload
                value={closingImageUrl}
                onChange={setClosingImageUrl}
                resourceType="image"
                label="Subir imagen"
                folder="lms/empresas/closing"
                compact
              />
            </div>
          </section>

          </TabsContent>

          <TabsContent value="seo" keepMounted className="space-y-6 mt-6">
          {/* SEO */}
          <section className={sectionCardClassName}>
            <SectionHeader
              icon={Search}
              title="SEO y metadatos"
              description="Opcional. Personaliza cómo aparece en Google y redes."
            />

            <div className="space-y-5 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle" className={fieldLabelClassName}>
                    Título SEO
                  </Label>
                  <Input
                    id="seoTitle"
                    name="seoTitle"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={name || "Si lo dejas vacío, se usa el nombre"}
                    maxLength={60}
                    className={controlClassName}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seoDescription" className={fieldLabelClassName}>
                    Meta descripción
                  </Label>
                  <Textarea
                    id="seoDescription"
                    name="seoDescription"
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    maxLength={160}
                    className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  />
                </div>

                <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Vista previa en Google
                  </p>
                  <div className="text-base text-[#1a0dab] hover:underline cursor-default truncate">
                    {seoTitle || name || "Nombre de la empresa"}
                  </div>
                  <div className="text-xs text-[#006621] flex items-center gap-1">
                    <Globe2 className="size-3" />
                    rivisig.com/empresas/{slug || "mi-empresa"}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {seoDescription || "Aparecerá la meta descripción aquí…"}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className={`${fieldLabelClassName} flex items-center gap-1.5`}>
                    <ImageIcon className="size-3.5" /> Imagen para redes (Open Graph)
                  </Label>
                  <CloudinaryUpload
                    value={ogImageUrl}
                    onChange={setOgImageUrl}
                    resourceType="image"
                    label="Subir imagen OG"
                    folder="lms/empresas/og"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
                    <ExternalLink className="size-3.5" /> URL canónica
                  </Label>
                  <Input
                    id="canonicalUrl"
                    name="canonicalUrl"
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://..."
                    className={controlClassName}
                  />
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-input bg-accent/30 px-4 py-3">
                  <Switch id="noIndex" checked={noIndex} onCheckedChange={setNoIndex} />
                  <Label htmlFor="noIndex" className="flex-1 cursor-pointer text-sm">
                    <div className="font-medium">No indexar</div>
                    <p className="text-xs text-muted-foreground">Bloquea a Google y excluye del sitemap.</p>
                  </Label>
                </div>
              </div>
          </section>
          </TabsContent>
          </Tabs>
        </div>

        {/* ── Sidebar ───────────────────────────────────── */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className={sectionCardClassName}>
            <div className="flex items-center gap-2">
              <Globe2 className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Publicación</h3>
            </div>

            <RadioGroup value={status} onValueChange={(v) => setStatus(v as PostStatusValue)} className="space-y-2">
              {POST_STATUSES.map((s) => (
                <label
                  key={s}
                  htmlFor={`status-${s}`}
                  className="flex items-center gap-3 cursor-pointer rounded-lg border border-input bg-background px-3 py-2.5 hover:border-primary/40 transition-colors"
                >
                  <RadioGroupItem id={`status-${s}`} value={s} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{POST_STATUS_LABELS[s]}</div>
                    {s === "DRAFT" && <p className="text-[11px] text-muted-foreground">Solo visible para admins.</p>}
                    {s === "SCHEDULED" && <p className="text-[11px] text-muted-foreground">Aparecerá al llegar la fecha.</p>}
                    {s === "PUBLISHED" && <p className="text-[11px] text-muted-foreground">Visible públicamente ahora.</p>}
                    {s === "ARCHIVED" && <p className="text-[11px] text-muted-foreground">Oculto del público.</p>}
                  </div>
                </label>
              ))}
            </RadioGroup>

            {(status === "SCHEDULED" || status === "PUBLISHED") && (
              <div className="space-y-2">
                <Label htmlFor="publishedAt" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
                  <Calendar className="size-3.5" /> Fecha de publicación
                </Label>
                <input
                  id="publishedAt"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full h-11 rounded-lg border border-border/80 bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  required={status === "SCHEDULED" || status === "PUBLISHED"}
                />
              </div>
            )}
          </section>

          <div className="space-y-2 pt-2 border-t border-border/60">
            <Button type="submit" disabled={pending} className="w-full h-12 rounded-lg text-[15px] font-semibold">
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {submitLabel}
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  {submitLabel}
                </>
              )}
            </Button>
            {company?.id && status === "PUBLISHED" && company.slug && (
              <a
                href={`/empresas/${company.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-center text-muted-foreground hover:text-primary inline-flex items-center justify-center gap-1 w-full"
              >
                <Eye className="size-3" /> Ver en sitio público
              </a>
            )}
          </div>
        </aside>
      </div>
    </form>
  );
}
