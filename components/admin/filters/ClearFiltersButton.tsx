"use client";

import { Button } from "@/components/ui/button";
import { useTableParams } from "@/components/admin/filters/use-table-params";

type Props = {
  /** Parámetros a borrar de la URL. */
  params: string[];
  label?: string;
};

export function ClearFiltersButton({ params, label = "Limpiar filtros" }: Props) {
  const { setParams } = useTableParams();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        setParams(Object.fromEntries(params.map((p) => [p, undefined])))
      }
    >
      {label}
    </Button>
  );
}
