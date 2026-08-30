"use client";

import { ShieldCheck } from "lucide-react";
import { COMPANY_ICON_MAP } from "@/lib/empresas/icons";

type Props = {
  name?: string | null;
  className?: string;
};

/** Dibuja el ícono guardado en la empresa a partir de su clave. */
export function CompanyIcon({ name, className }: Props) {
  const Icon = (name && COMPANY_ICON_MAP[name]) || ShieldCheck;
  return <Icon className={className} />;
}
