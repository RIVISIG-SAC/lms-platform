"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTableParams } from "@/components/admin/filters/use-table-params";

type Option = { value: string; label: string };

type Props = {
  param: string;
  options: Option[];
  /** Etiqueta de la opción "todos", que borra el parámetro de la URL. */
  allLabel: string;
  placeholder?: string;
  className?: string;
};

/** Filtro de lista desplegable cuyo valor vive en la URL. */
export function FilterSelect({
  param,
  options,
  allLabel,
  placeholder,
  className,
}: Props) {
  const { getParam, setParams } = useTableParams();
  const value = getParam(param, "all");

  return (
    <Select
      value={value}
      onValueChange={(v) => setParams({ [param]: v ?? undefined })}
    >
      <SelectTrigger className={className ?? "h-9 min-w-[140px]"} aria-label={placeholder ?? allLabel}>
        <SelectValue placeholder={placeholder ?? allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
