"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Award,
  CalendarDays,
  FileText,
  Infinity as InfinityIcon,
  Loader2,
  Save,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VALIDITY_OPTIONS } from "@/lib/validations/course";
import { addDays, cn, formatDate } from "@/lib/utils";

type ActionState = { error?: string; success?: boolean } | null;
type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

type Props = {
  action: Action;
};

/** Opciones de vigencia: sin vencimiento, las estándar del sistema y una libre. */
type Vigencia = "none" | "custom" | number;

const OPCIONES_VIGENCIA: { value: Vigencia; label: string }[] = [
  { value: "none", label: "Sin vencimiento" },
  ...VALIDITY_OPTIONS.map((o) => ({ value: o.value as Vigencia, label: o.label })),
  { value: "custom", label: "Personalizado" },
];

const CONTROL =
  "h-11 rounded-xl border-border bg-background text-sm focus-visible:border-primary focus-visible:ring-primary/25";
const MAX_DESCRIPCION = 400;

function Seccion({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3 border-b border-border pb-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function Campo({
  id,
  label,
  hint,
  className,
  children,
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint}
    </div>
  );
}

const OPCIONAL = (
  <span className="font-normal text-muted-foreground/60">(opcional)</span>
);

export function ManualCertificateForm({ action }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    null,
  );
  const [vigencia, setVigencia] = useState<Vigencia>("none");
  const [customDays, setCustomDays] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [holderName, setHolderName] = useState("");
  const [holderCompany, setHolderCompany] = useState("");
  const [holderDni, setHolderDni] = useState("");

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.success) {
      toast.success("Certificado manual creado");
      router.push("/admin/certificates");
    }
  }, [state, router]);

  const dias =
    vigencia === "none"
      ? null
      : vigencia === "custom"
        ? Number(customDays) || null
        : vigencia;
  const vence =
    dias && dias >= 1 && dias <= 3650 ? addDays(new Date(), dias) : null;

  return (
    <form action={formAction} className="space-y-5">
      <Seccion
        icon={UserIcon}
        title="Datos del titular"
        description="En el PDF la empresa va encima del nombre y el DNI debajo."
      >
        <div className="space-y-5">
          <Campo id="holderCompany" label={<>Empresa {OPCIONAL}</>}>
            <Input
              id="holderCompany"
              name="holderCompany"
              maxLength={100}
              value={holderCompany}
              onChange={(e) => setHolderCompany(e.target.value)}
              placeholder="Ej. ACME S.A."
              className={CONTROL}
            />
          </Campo>

          <Campo id="holderName" label="Nombre completo">
            <Input
              id="holderName"
              name="holderName"
              required
              minLength={3}
              maxLength={120}
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="Ej. Juan Pérez García"
              className={CONTROL}
            />
          </Campo>

          <Campo
            id="holderDni"
            label={<>DNI {OPCIONAL}</>}
            hint={
              <p className="text-[11px] text-muted-foreground">
                Entre 6 y 12 dígitos.
              </p>
            }
          >
            <Input
              id="holderDni"
              name="holderDni"
              inputMode="numeric"
              pattern="\d{6,12}"
              maxLength={12}
              value={holderDni}
              onChange={(e) =>
                setHolderDni(e.target.value.replace(/\D/g, "").slice(0, 12))
              }
              placeholder="Ej. 12345678"
              className={CONTROL}
            />
          </Campo>
        </div>
      </Seccion>

      <Seccion
        icon={FileText}
        title="Título y descripción"
        description="El texto que se imprimirá en el certificado."
      >
        <div className="space-y-5">
          <Campo id="certificateTitle" label="Título del certificado">
            <Input
              id="certificateTitle"
              name="certificateTitle"
              required
              minLength={3}
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Certificado de Auditor Interno ISO 9001"
              className={CONTROL}
            />
          </Campo>

          <Campo
            id="customDescription"
            label={<>Descripción {OPCIONAL}</>}
            hint={
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Si la dejas vacía se usará el texto por defecto del sistema.
                </p>
                <span
                  className={cn(
                    "shrink-0 text-[11px] tabular-nums",
                    description.length > MAX_DESCRIPCION * 0.9
                      ? "font-semibold text-amber-700"
                      : "text-muted-foreground",
                  )}
                >
                  {description.length}/{MAX_DESCRIPCION}
                </span>
              </div>
            }
          >
            <Textarea
              id="customDescription"
              name="customDescription"
              rows={4}
              maxLength={MAX_DESCRIPCION}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Texto que aparecerá bajo el título en el PDF"
              className="min-h-28 resize-none rounded-xl border-border bg-background text-sm focus-visible:border-primary focus-visible:ring-primary/25"
            />
          </Campo>
        </div>
      </Seccion>

      <Seccion
        icon={CalendarDays}
        title="Vigencia"
        description="Un solo control: elige si vence y cuándo."
      >
        <input
          type="hidden"
          name="certificateValidityDays"
          value={dias ? String(dias) : ""}
        />

        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Vigencia del certificado</legend>
          {OPCIONES_VIGENCIA.map(({ value, label }) => {
            const activo = vigencia === value;
            return (
              <label
                key={String(value)}
                className={cn(
                  "relative inline-flex min-h-10 cursor-pointer items-center rounded-xl border px-4 text-sm transition-all",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40",
                  activo
                    ? "border-primary bg-primary/5 font-semibold text-primary ring-1 ring-primary/30"
                    : "border-border font-medium text-foreground hover:border-primary/30 hover:bg-accent/40",
                )}
              >
                <input
                  type="radio"
                  name="vigencia-ui"
                  checked={activo}
                  onChange={() => setVigencia(value)}
                  className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
                />
                {label}
              </label>
            );
          })}
        </fieldset>

        {vigencia === "custom" && (
          <Campo
            id="customDays"
            label="Días de validez"
            className="mt-5 max-w-45"
            hint={
              <p className="text-[11px] text-muted-foreground">
                Entre 1 y 3650 días.
              </p>
            }
          >
            <div className="relative">
              <Input
                id="customDays"
                type="number"
                min="1"
                max="3650"
                step="1"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="545"
                className={cn(CONTROL, "pr-12")}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                días
              </span>
            </div>
          </Campo>
        )}

        <p className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
          {vence ? (
            <>
              <CalendarDays className="size-3.5 shrink-0 text-primary" />
              Vencerá el{" "}
              <span className="font-semibold text-foreground">
                {formatDate(vence)}
              </span>
            </>
          ) : (
            <>
              <InfinityIcon className="size-3.5 shrink-0 text-primary" />
              {vigencia === "custom"
                ? "Indica los días de validez para calcular la fecha de vencimiento."
                : "El certificado no caducará."}
            </>
          )}
        </p>
      </Seccion>

      {/* Resumen de cómo quedará compuesto el certificado */}
      <Seccion
        icon={Award}
        title="Resumen"
        description="Así se ordenarán los datos en el certificado."
      >
        <div className="space-y-1 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            {holderCompany.trim() || "— sin empresa —"}
          </p>
          <p
            className={cn(
              "text-lg font-black leading-snug tracking-tight",
              holderName.trim() ? "text-foreground" : "text-muted-foreground/50",
            )}
          >
            {holderName.trim() || "Nombre del titular"}
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">
            {holderDni ? `DNI ${holderDni}` : "— sin DNI —"}
          </p>
          <p
            className={cn(
              "mt-3 border-t border-border pt-3 text-sm font-bold",
              title.trim() ? "text-primary" : "text-muted-foreground/50",
            )}
          >
            {title.trim() || "Título del certificado"}
          </p>
          {description.trim() && (
            <p className="mx-auto max-w-md text-xs leading-relaxed text-muted-foreground">
              {description.trim()}
            </p>
          )}
          <p className="pt-2 text-[11px] text-muted-foreground">
            {vence ? `Válido hasta el ${formatDate(vence)}` : "Sin vencimiento"}
          </p>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          El código de verificación se genera automáticamente al emitir.
        </p>
      </Seccion>

      {state?.error && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-xs leading-relaxed text-muted-foreground">
          El certificado se emitirá como <strong>activo</strong> y será
          verificable públicamente de inmediato.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/certificates")}
            className="min-h-11 justify-center font-semibold sm:min-h-10"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={pending || title.trim().length < 3 || holderName.trim().length < 3}
            className="min-h-11 justify-center gap-2 font-semibold sm:min-h-10"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Emitiendo...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Emitir certificado
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
