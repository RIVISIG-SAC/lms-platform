import {
  Award,
  Building2,
  Heart,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export const COMPANY_ICON_OPTIONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "shield", label: "Especialidad / Seguridad", Icon: ShieldCheck },
  { key: "users", label: "Clientes / Equipo", Icon: Users },
  { key: "award", label: "Experiencia / Reconocimiento", Icon: Award },
  { key: "building", label: "Empresa", Icon: Building2 },
  { key: "target", label: "Compromiso / Objetivo", Icon: Target },
  { key: "heart", label: "Valores", Icon: Heart },
  { key: "trophy", label: "Logro", Icon: Trophy },
];

const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  COMPANY_ICON_OPTIONS.map(({ key, Icon }) => [key, Icon]),
);

export function getCompanyIcon(key: string | null | undefined): LucideIcon {
  return (key && ICON_MAP[key]) || ShieldCheck;
}
