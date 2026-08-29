"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props<T> = {
  name: string;
  items: T[];
  emptyItem: T;
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel?: string;
  emptyMessage?: string;
};

export function RepeaterField<T extends Record<string, unknown>>({
  name,
  items: initialItems,
  emptyItem,
  renderItem,
  addLabel = "Agregar",
  emptyMessage = "Aún no hay elementos.",
}: Props<T>) {
  const [items, setItems] = useState<T[]>(initialItems);

  function update(index: number, patch: Partial<T>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    setItems((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length === 0 && <p className="text-xs text-muted-foreground italic">{emptyMessage}</p>}

      {items.map((item, index) => (
        <div key={index} className="relative rounded-lg border border-border/70 bg-background p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              #{index + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Subir"
              >
                <ChevronUp className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label="Bajar"
              >
                <ChevronDown className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                className="text-destructive hover:bg-destructive/10"
                aria-label="Eliminar"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
          {renderItem(item, index, (patch) => update(index, patch))}
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={() => setItems((prev) => [...prev, emptyItem])}>
        <Plus className="size-4" /> {addLabel}
      </Button>
    </div>
  );
}
