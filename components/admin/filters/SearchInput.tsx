"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTableParams } from "@/components/admin/filters/use-table-params";

type Props = {
  placeholder: string;
  /** Nombre del parámetro en la URL. */
  param?: string;
  className?: string;
};

/**
 * Buscador que escribe en la URL con debounce.
 *
 * El input mantiene su propio estado para que escribir siga siendo fluido; la
 * navegación (y por tanto la consulta a la BD) sólo ocurre cuando el admin
 * deja de teclear.
 */
export function SearchInput({ placeholder, param = "q", className }: Props) {
  const { getParam, setParams, isPending } = useTableParams();
  const urlValue = getParam(param);
  const [value, setValue] = useState(urlValue);
  const lastPushed = useRef(urlValue);

  // Si la URL cambia por fuera (back del navegador, "limpiar filtros"),
  // el input debe reflejarlo.
  useEffect(() => {
    if (urlValue !== lastPushed.current) {
      lastPushed.current = urlValue;
      setValue(urlValue);
    }
  }, [urlValue]);

  useEffect(() => {
    if (value === lastPushed.current) return;

    const timer = setTimeout(() => {
      lastPushed.current = value;
      setParams({ [param]: value.trim() || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [value, param, setParams]);

  return (
    <div className={cn("relative w-full md:max-w-md", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={placeholder}
        className="pl-9"
      />
      {isPending && (
        <Loader2
          className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
