"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Tag as TagIcon, Save } from "lucide-react";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/app/actions/blog";
import { toSlug } from "@/lib/blog/slug-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { posts: number };
};

type Props = {
  categories: CategoryRow[];
};

type ActionState = { error?: string; success?: boolean } | null;

function CreateForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createCategory,
    null,
  );
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.success) {
      toast.success("Categoría creada");
      setName("");
      setSlug("");
      setSlugManual(false);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Plus className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Nueva categoría</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cat-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cat-name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugManual) setSlug(toSlug(e.target.value));
            }}
            placeholder="Ej. Auditoría ISO"
            required
            maxLength={60}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-slug" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Slug
          </Label>
          <Input
            id="cat-slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManual(true);
            }}
            placeholder="auditoria-iso"
            maxLength={80}
            className="h-10 font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Descripción
        </Label>
        <Textarea
          id="cat-description"
          name="description"
          placeholder="Opcional. Aparece en algunas vistas para describir la categoría."
          maxLength={200}
          rows={2}
          className="resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creando…
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Crear categoría
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function EditDialog({
  category,
  open,
  onOpenChange,
}: {
  category: CategoryRow | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateCategory,
    null,
  );
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");

  useEffect(() => {
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
    setDescription(category?.description ?? "");
  }, [category]);

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.success) {
      toast.success("Categoría actualizada");
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar categoría</DialogTitle>
          <DialogDescription>
            Actualiza el nombre, slug o descripción de esta categoría.
          </DialogDescription>
        </DialogHeader>
        {category && (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={category.id} />
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                maxLength={80}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={2}
                className="resize-none"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Guardar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CategoriesManager({ categories }: Props) {
  const [editing, setEditing] = useState<CategoryRow | null>(null);

  return (
    <div className="space-y-6">
      <CreateForm />

      {categories.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="Aún no tienes categorías"
          description="Crea la primera categoría usando el formulario de arriba."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-widest font-bold text-muted-foreground bg-accent/30">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Posts</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-accent/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{c.name}</div>
                    {c.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">/{c.slug}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {c._count.posts}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditing(c)}
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <DeleteConfirmDialog
                        action={deleteCategory.bind(null, c.id)}
                        title="¿Eliminar categoría?"
                        description={`Los ${c._count.posts} posts asignados perderán esta categoría (no se eliminarán).`}
                        triggerLabel="Eliminar"
                        successMessage="Categoría eliminada"
                        variant="icon"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditDialog
        category={editing}
        open={editing !== null}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
        }}
      />
    </div>
  );
}
