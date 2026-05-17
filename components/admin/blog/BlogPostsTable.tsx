"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Copy,
  ExternalLink,
  FileX,
  Files,
  MoreVertical,
  Pencil,
  Search,
  Tag as TagIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { deletePost, duplicatePost } from "@/app/actions/blog";
import {
  POST_STATUSES,
  POST_STATUS_LABELS,
  type PostStatusValue,
} from "@/lib/validations/blog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/admin/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

export type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  status: PostStatusValue;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string } | null;
  author: { id: string; name: string };
  _count?: { tags: number };
};

const STATUS_BADGE: Record<PostStatusValue, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  SCHEDULED: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950 dark:text-amber-200",
  PUBLISHED: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300",
};

type StatusFilter = PostStatusValue | "all";

type Props = {
  posts: BlogPostRow[];
  categories: { id: string; name: string }[];
};

export function BlogPostsTable({ posts, categories }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [categoryId, setCategoryId] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (q) {
        const haystack = `${p.title} ${p.slug} ${p.excerpt ?? ""} ${p.category?.name ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (status !== "all" && p.status !== status) return false;
      if (categoryId !== "all" && p.category?.id !== categoryId) return false;
      return true;
    });
  }, [posts, query, status, categoryId]);

  const hasFilters = query.length > 0 || status !== "all" || categoryId !== "all";

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copiado al portapapeles");
  };

  const handleDuplicate = async (id: string) => {
    const res = await duplicatePost(id);
    if ("error" in res) toast.error(res.error);
    else toast.success("Post duplicado como borrador");
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Buscar por título, slug o categoría…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger className="h-9 min-w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {POST_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {POST_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "all")}>
            <SelectTrigger className="h-9 min-w-[160px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setStatus("all");
                setCategoryId("all");
              }}
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileX}
          title={hasFilters ? "Ningún post coincide con los filtros" : "Aún no hay artículos"}
          description={
            hasFilters
              ? "Prueba cambiando los criterios de búsqueda."
              : "Crea tu primer artículo del blog y empieza a publicar contenido editorial."
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  setCategoryId("all");
                }}
              >
                Limpiar filtros
              </Button>
            ) : (
              <Link
                href="/admin/blog/new"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Crear el primer artículo →
              </Link>
            )
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-accent/30">
                  <th className="px-4 py-3">Artículo</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Publicación</th>
                  <th className="px-4 py-3">Autor</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((post) => (
                  <tr key={post.id} className="group hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="size-12 w-16 rounded-md bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center">
                          {post.coverImageUrl ? (
                            <Image
                              src={post.coverImageUrl}
                              alt={post.title}
                              width={64}
                              height={48}
                              className="object-cover size-full"
                              unoptimized
                            />
                          ) : (
                            <Files className="size-4 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-[320px]">
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="font-semibold text-foreground truncate group-hover:text-primary transition-colors block"
                          >
                            {post.title}
                          </Link>
                          <p className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
                            /blog/{post.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {post.category ? (
                        <Badge variant="outline" className="gap-1 text-[10px] font-semibold w-fit">
                          <TagIcon className="size-3" /> {post.category.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                          STATUS_BADGE[post.status],
                        )}
                      >
                        {POST_STATUS_LABELS[post.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {post.publishedAt ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                          <Calendar className="size-3.5" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{post.author.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-background text-xs font-semibold hover:text-primary hover:border-primary/40 transition-colors"
                        >
                          <Pencil className="size-3.5" /> Editar
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Más acciones"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem render={<Link href={`/admin/blog/${post.id}/edit`} />}>
                              <Pencil className="size-4" />
                              Editar
                            </DropdownMenuItem>
                            {post.status === "PUBLISHED" && (
                              <DropdownMenuItem
                                render={
                                  <Link
                                    href={`/blog/${post.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  />
                                }
                              >
                                <ExternalLink className="size-4" />
                                Ver público
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDuplicate(post.id)}>
                              <Files className="size-4" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyId(post.id)}>
                              <Copy className="size-4" />
                              Copiar ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              render={
                                <DeleteConfirmDialog
                                  action={deletePost.bind(null, post.id)}
                                  title="¿Eliminar artículo?"
                                  description={`Se eliminará permanentemente "${post.title}".`}
                                  triggerLabel="Eliminar artículo"
                                  successMessage="Artículo eliminado"
                                  variant="link"
                                  triggerClassName="w-full flex items-center gap-1.5 text-sm text-destructive text-left"
                                />
                              }
                            >
                              <Trash2 className="size-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
