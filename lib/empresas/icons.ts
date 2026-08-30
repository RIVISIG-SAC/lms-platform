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

/**
 * Íconos disponibles para los "datos rápidos" y las normas certificadas.
 * `label` describe el DIBUJO (es lo que el editor ve en la landing) y `hint`
 * sugiere para qué suele usarse. Las `key` se guardan en base de datos: no
 * cambiarlas sin migrar los registros existentes.
 */
export const COMPANY_ICON_OPTIONS: {
  key: string;
  label: string;
  hint: string;
  Icon: LucideIcon;
}[] = [
  { key: "shield", label: "Escudo", hint: "seguridad, protección, normas", Icon: ShieldCheck },
  { key: "users", label: "Personas", hint: "equipo, clientes, colaboradores", Icon: Users },
  { key: "award", label: "Medalla", hint: "experiencia, reconocimiento", Icon: Award },
  { key: "building", label: "Edificio", hint: "sedes, empresa, instalaciones", Icon: Building2 },
  { key: "target", label: "Diana", hint: "objetivos, compromiso, metas", Icon: Target },
  { key: "heart", label: "Corazón", hint: "valores, salud, bienestar", Icon: Heart },
  { key: "trophy", label: "Trofeo", hint: "logros, premios", Icon: Trophy },
];

export const COMPANY_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  COMPANY_ICON_OPTIONS.map(({ key, Icon }) => [key, Icon]),
);

export function getCompanyIcon(key: string | null | undefined): LucideIcon {
  return (key && COMPANY_ICON_MAP[key]) || ShieldCheck;
}

export function getCompanyIconLabel(key: string | null | undefined): string {
  return COMPANY_ICON_OPTIONS.find((opt) => opt.key === key)?.label ?? "Escudo";
}
