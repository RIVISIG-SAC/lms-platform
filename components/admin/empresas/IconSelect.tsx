"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompanyIcon } from "@/components/admin/empresas/CompanyIcon";
import { COMPANY_ICON_OPTIONS, getCompanyIconLabel } from "@/lib/empresas/icons";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

/** Selector de ícono que muestra el dibujo real, no sólo su nombre. */
export function IconSelect({ id, value, onChange, className }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange((v as string) || "shield")}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder="Ícono">
          <span className="flex items-center gap-2">
            <CompanyIcon name={value} className="size-4 text-primary" />
            <span className="truncate">{getCompanyIconLabel(value)}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {COMPANY_ICON_OPTIONS.map(({ key, label, hint, Icon }) => (
          <SelectItem key={key} value={key}>
            <span className="flex items-center gap-2">
              <Icon className="size-4 text-primary" />
              <span className="font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
