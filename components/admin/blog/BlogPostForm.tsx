"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  Eye,
  Calendar,
  FileText,
  ImageIcon,
  Search,
  Tag as TagIcon,
  Globe2,
  ChevronDown,
  Hash,
  AlignLeft,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { RichTextEditor } from "@/components/admin/blog/RichTextEditor";
import { TagsCombobox } from "@/components/admin/blog/TagsCombobox";
import {
  POST_STATUSES,
  POST_STATUS_LABELS,
  type PostStatusValue,
} from "@/lib/validations/blog";
import { toSlug } from "@/lib/blog/slug-client";

type ActionState = { error?: string; success?: boolean } | null;
type PostAction = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export type BlogPostFormValues = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  coverImageUrl?: string | null;
  status?: PostStatusValue;
  publishedAt?: Date | null;
  categoryId?: string | null;
  tagIds?: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
};

export type BlogCategoryOption = { id: string; name: string };
export type BlogTagOption = { id: string; name: string; slug: string };

type Props = {
  action: PostAction;
  post?: BlogPostFormValues;
  categories: BlogCategoryOption[];
  tags: BlogTagOption[];
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

export function BlogPostForm({ action, post, categories, tags }: Props) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [status, setStatus] = useState<PostStatusValue>(post?.status ?? "DRAFT");
  const [publishedAt, setPublishedAt] = useState<string>(toLocalDateTimeInput(post?.publishedAt));
  const [categoryId, setCategoryId] = useState<string>(post?.categoryId ?? "");
  const [tagIds, setTagIds] = useState<string[]>(post?.tagIds ?? []);

  const [seoOpen, setSeoOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(post?.ogImageUrl ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl ?? "");
  const [noIndex, setNoIndex] = useState(post?.noIndex ?? false);

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.success) toast.success("Cambios guardados correctamente");
  }, [state]);

  const onTitleBlur = () => {
    if (!slugManuallyEdited && title.trim()) {
      setSlug(toSlug(title));
    }
  };

  const onSlugChange = (value: string) => {
    setSlug(value);
    setSlugManuallyEdited(value.length > 0);
  };

  const submitLabel = useMemo(() => {
    if (pending) return "Guardando…";
    switch (status) {
      case "PUBLISHED":
        return post ? "Guardar y publicar" : "Publicar";
      case "SCHEDULED":
        return "Programar publicación";
      case "ARCHIVED":
        return "Guardar y archivar";
      default:
        return post ? "Guardar borrador" : "Crear borrador";
    }
  }, [status, pending, post]);

  return (
    <form action={formAction} className="space-y-8">
      {post?.id && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="publishedAt" value={publishedAt} />
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="tagIds" value={tagIds.join(",")} />
      <input type="hidden" name="ogImageUrl" value={ogImageUrl} />
      <input type="hidden" name="noIndex" value={noIndex ? "true" : "false"} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Columna principal: Identidad + Editor ───────────── */}
        <div className="lg:col-span-2 space-y-6">
          <section className={sectionCardClassName}>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="size-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Identidad del artículo</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Título, slug y resumen visibles en tarjetas y SEO.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className={fieldLabelClassName}>
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={onTitleBlur}
                  placeholder="Ej. Cómo prepararse para una auditoría ISO 9001"
                  className="h-12 text-lg font-semibold rounded-lg border-border/80 bg-background"
                  maxLength={140}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Entre 5 y 140 caracteres.</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{title.length}/140</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
                  <Hash className="size-3.5" /> Slug
                  <Badge variant="outline" className="ml-2 text-[10px] font-normal py-0">
                    {slugManuallyEdited ? "manual" : "auto"}
                  </Badge>
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">/blog/</span>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => onSlugChange(e.target.value)}
                    placeholder="mi-articulo"
                    className={controlClassName}
                    maxLength={160}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo minúsculas, números y guiones. Se autogenera del título si lo dejas vacío.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
                  <AlignLeft className="size-3.5" /> Resumen
                </Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Una línea atractiva que invite a leer el artículo."
                  maxLength={300}
                  className="resize-none rounded-lg border-border/80 bg-background text-sm"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Aparece en tarjetas y meta tags.</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{excerpt.length}/300</p>
                </div>
              </div>
            </div>
          </section>

          <section className={sectionCardClassName}>
            <div className="flex items-start gap-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Pencil className="size-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">Contenido</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Editor con formato enriquecido. Las imágenes se suben a Cloudinary.
                </p>
              </div>
            </div>

            <RichTextEditor value={content} onChange={setContent} />
          </section>

          {/* ── SEO ─────────────────────────────────────────── */}
          <section className={sectionCardClassName}>
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              className="flex items-center gap-3 w-full text-left"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="size-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">SEO y metadatos</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Opcional. Personaliza cómo aparece el post en Google y redes.
                </p>
              </div>
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform ${seoOpen ? "rotate-180" : ""}`}
              />
            </button>

            {seoOpen && (
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
                    placeholder={title || "Si lo dejas vacío, se usa el título del post"}
                    maxLength={60}
                    className={controlClassName}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Idealmente 50-60 caracteres.</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{seoTitle.length}/60</p>
                  </div>
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
                    placeholder={excerpt || "Si lo dejas vacío, se usa el resumen"}
                    maxLength={160}
                    className="resize-none rounded-lg border-border/80 bg-background text-sm"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Idealmente 150-160 caracteres.</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{seoDescription.length}/160</p>
                  </div>
                </div>

                {/* Preview SERP */}
                <div className="rounded-lg border bg-muted/30 p-4 space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Vista previa en Google
                  </p>
                  <div className="text-base text-[#1a0dab] hover:underline cursor-default truncate">
                    {seoTitle || title || "Título del artículo"}
                  </div>
                  <div className="text-xs text-[#006621] flex items-center gap-1">
                    <Globe2 className="size-3" />
                    rivisig.com/blog/{slug || "mi-articulo"}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {seoDescription || excerpt || "Aparecerá la meta descripción aquí…"}
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
                    folder="lms/blog/og"
                  />
                  <p className="text-xs text-muted-foreground">
                    Opcional. Si lo dejas vacío, se usa la imagen de portada.
                  </p>
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
                  <p className="text-xs text-muted-foreground">
                    Usa esto si el contenido original vive en otra URL.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-input bg-accent/30 px-4 py-3">
                  <Switch id="noIndex" checked={noIndex} onCheckedChange={setNoIndex} />
                  <Label htmlFor="noIndex" className="flex-1 cursor-pointer text-sm">
                    <div className="font-medium">No indexar</div>
                    <p className="text-xs text-muted-foreground">
                      Bloquea a Google y excluye este post del sitemap.
                    </p>
                  </Label>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ── Sidebar: Meta ───────────────────────────────────── */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className={sectionCardClassName}>
            <div className="flex items-center gap-2">
              <Globe2 className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Publicación</h3>
            </div>

            <RadioGroup
              value={status}
              onValueChange={(v) => setStatus(v as PostStatusValue)}
              className="space-y-2"
            >
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
                    {s === "SCHEDULED" && (
                      <p className="text-[11px] text-muted-foreground">Aparecerá al llegar la fecha.</p>
                    )}
                    {s === "PUBLISHED" && (
                      <p className="text-[11px] text-muted-foreground">Visible públicamente ahora.</p>
                    )}
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
                <p className="text-xs text-muted-foreground">
                  {status === "SCHEDULED"
                    ? "Programado para esta fecha futura."
                    : "Fecha mostrada en el artículo."}
                </p>
              </div>
            )}
          </section>

          <section className={sectionCardClassName}>
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Portada</h3>
            </div>
            <CloudinaryUpload
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              resourceType="image"
              label="Subir imagen de portada"
              folder="lms/blog/covers"
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 1200×630 (proporción 1.91:1).
            </p>
          </section>

          <section className={sectionCardClassName}>
            <div className="flex items-center gap-2">
              <TagIcon className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Clasificación</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className={fieldLabelClassName}>
                Categoría
              </Label>
              <Select
                value={categoryId || "__none__"}
                onValueChange={(v) => setCategoryId(typeof v === "string" && v !== "__none__" ? v : "")}
              >
                <SelectTrigger className={`${controlClassName} w-full`}>
                  <SelectValue placeholder="Sin categoría">
                    {categoryId && categories.find((c) => c.id === categoryId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin categoría</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <a
                href="/admin/blog/categories"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Gestionar categorías
              </a>
            </div>

            <div className="space-y-2">
              <Label className={fieldLabelClassName}>Etiquetas</Label>
              <TagsCombobox options={tags} selectedIds={tagIds} onChange={setTagIds} />
              <p className="text-xs text-muted-foreground">Hasta 10 etiquetas por artículo.</p>
            </div>
          </section>

          <div className="space-y-2 pt-2 border-t border-border/60">
            <Button
              type="submit"
              disabled={pending}
              className="w-full h-12 rounded-lg text-[15px] font-semibold"
            >
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
            {post?.id && status === "PUBLISHED" && post.slug && (
              <a
                href={`/blog/${post.slug}`}
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
