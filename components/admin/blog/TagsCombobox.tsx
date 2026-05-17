"use client";

import { useState, useTransition } from "react";
import { Check, Plus, X, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { createTag } from "@/app/actions/blog";
import { toast } from "sonner";

type TagOption = { id: string; name: string; slug: string };

type Props = {
  options: TagOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function TagsCombobox({ options, selectedIds, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<TagOption[]>(options);
  const [pending, startTransition] = useTransition();

  const selected = items.filter((t) => selectedIds.includes(t.id));
  const filtered = items.filter(
    (t) => !selectedIds.includes(t.id) && t.name.toLowerCase().includes(query.toLowerCase()),
  );
  const exact = items.some((t) => t.name.toLowerCase() === query.toLowerCase());

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      if (selectedIds.length >= 10) {
        toast.error("Máximo 10 etiquetas");
        return;
      }
      onChange([...selectedIds, id]);
    }
  };

  const onCreate = () => {
    const name = query.trim();
    if (!name) return;
    startTransition(async () => {
      const res = await createTag(name);
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      const tag = res.data!;
      setItems((prev) => (prev.some((t) => t.id === tag.id) ? prev : [...prev, tag]));
      if (!selectedIds.includes(tag.id) && selectedIds.length < 10) {
        onChange([...selectedIds, tag.id]);
      }
      setQuery("");
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-8">
        {selected.length === 0 && (
          <span className="text-xs text-muted-foreground italic">Sin etiquetas asignadas</span>
        )}
        {selected.map((t) => (
          <Badge key={t.id} variant="secondary" className="gap-1 pl-2 pr-1">
            <TagIcon className="size-3" />
            {t.name}
            <button
              type="button"
              onClick={() => toggle(t.id)}
              className="rounded-full hover:bg-foreground/10 p-0.5"
              aria-label={`Quitar ${t.name}`}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button type="button" variant="outline" size="sm" className="w-full justify-start">
              <Plus className="size-3.5" />
              Buscar o crear etiqueta
            </Button>
          }
        />
        <PopoverContent className="w-72 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar etiqueta…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>
                <div className="px-2 py-3 text-sm">
                  {query.trim() ? "Sin coincidencias" : "Escribe para buscar"}
                </div>
              </CommandEmpty>
              {filtered.length > 0 && (
                <CommandGroup heading="Etiquetas">
                  {filtered.map((t) => (
                    <CommandItem
                      key={t.id}
                      value={t.name}
                      onSelect={() => {
                        toggle(t.id);
                        setQuery("");
                      }}
                    >
                      <TagIcon className="size-3.5" />
                      {t.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {query.trim() && !exact && (
                <CommandGroup heading="Crear nueva">
                  <CommandItem
                    value={`__create__${query}`}
                    disabled={pending}
                    onSelect={onCreate}
                  >
                    <Plus className="size-3.5" />
                    Crear &quot;{query.trim()}&quot;
                  </CommandItem>
                </CommandGroup>
              )}
              {selected.length > 0 && (
                <CommandGroup heading="Seleccionadas">
                  {selected.map((t) => (
                    <CommandItem key={t.id} value={t.name} onSelect={() => toggle(t.id)}>
                      <Check className="size-3.5" />
                      {t.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
