import {
  Clock3,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type EstadoVerificacion =
  | "ACTIVE"
  | "EXPIRED"
  | "REVOKED"
  | "PENDING_PAYMENT"
  | "NOT_FOUND";

export type FilaCertificado = {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
  tone?: "default" | "amber";
};

type Config = {
  icon: LucideIcon;
  badge: string;
  title: string;
  subtitle: string;
  /** Clases del bloque de cabecera y del distintivo. */
  header: string;
  chip: string;
  badgeClass: string;
  borde: string;
};

const ESTADOS: Record<EstadoVerificacion, Config> = {
  ACTIVE: {
    icon: ShieldCheck,
    badge: "Vigente",
    title: "Certificado válido",
    subtitle: "Es auténtico y se encuentra vigente.",
    header: "border-emerald-200 bg-emerald-50/70",
    chip: "bg-emerald-100 text-emerald-700",
    badgeClass: "bg-emerald-600 text-white",
    borde: "border-emerald-200",
  },
  EXPIRED: {
    icon: ShieldAlert,
    badge: "Vencido",
    title: "Certificado vencido",
    subtitle: "Fue emitido por nosotros, pero su vigencia ya terminó.",
    header: "border-amber-200 bg-amber-50/70",
    chip: "bg-amber-100 text-amber-700",
    badgeClass: "bg-amber-500 text-white",
    borde: "border-amber-200",
  },
  PENDING_PAYMENT: {
    icon: Clock3,
    badge: "Sin emitir",
    title: "Certificado aún no emitido",
    subtitle:
      "El titular aprobó el curso, pero el certificado está pendiente de pago.",
    header: "border-amber-200 bg-amber-50/70",
    chip: "bg-amber-100 text-amber-700",
    badgeClass: "bg-amber-500 text-white",
    borde: "border-amber-200",
  },
  REVOKED: {
    icon: ShieldX,
    badge: "Revocado",
    title: "Certificado revocado",
    subtitle: "Fue anulado por RIVISIG y ya no tiene validez.",
    header: "border-destructive/20 bg-destructive/5",
    chip: "bg-destructive/10 text-destructive",
    badgeClass: "bg-destructive text-white",
    borde: "border-destructive/20",
  },
  NOT_FOUND: {
    icon: ShieldX,
    badge: "No encontrado",
    title: "No existe ese certificado",
    subtitle: "Ningún certificado emitido por RIVISIG usa este código.",
    header: "border-destructive/20 bg-destructive/5",
    chip: "bg-destructive/10 text-destructive",
    badgeClass: "bg-destructive text-white",
    borde: "border-destructive/20",
  },
};

export function CertificateResult({
  estado,
  filas,
  nota,
}: {
  estado: EstadoVerificacion;
  filas: FilaCertificado[];
  nota?: React.ReactNode;
}) {
  const cfg = ESTADOS[estado];
  const Icon = cfg.icon;

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card", cfg.borde)}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 border-b px-5 py-5 sm:px-6",
          cfg.header,
        )}
      >
        <span
          className={cn(
            "inline-flex size-12 shrink-0 items-center justify-center rounded-xl",
            cfg.chip,
          )}
        >
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-black tracking-tight text-foreground">
            {cfg.title}
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            {cfg.subtitle}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
            cfg.badgeClass,
          )}
        >
          {cfg.badge}
        </span>
      </div>

      {filas.length > 0 && (
        <dl className="divide-y divide-border px-5 sm:px-6">
          {filas.map(({ icon: FilaIcon, label, value, mono, tone }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 py-3.5"
            >
              <dt className="flex shrink-0 items-center gap-2.5 text-sm text-muted-foreground">
                <FilaIcon className="size-3.5" />
                {label}
              </dt>
              <dd
                className={cn(
                  "min-w-0 text-right text-sm font-semibold",
                  mono && "font-mono tracking-wider",
                  tone === "amber" ? "text-amber-700" : "text-foreground",
                )}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {nota && (
        <div className="border-t border-border bg-muted/30 px-5 py-4 sm:px-6">
          {nota}
        </div>
      )}
    </div>
  );
}
