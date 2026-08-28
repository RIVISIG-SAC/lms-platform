"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  FileText,
  IdCard,
  Loader2,
  Save,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { VALIDITY_OPTIONS } from "@/lib/validations/course";

type ActionState = { error?: string; success?: boolean } | null;
type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

type Props = {
  action: Action;
};

const fieldLabelClassName =
  "text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const sectionCardClassName =
  "space-y-5 rounded-xl border border-border/70 bg-card p-5 md:p-6";
const controlClassName =
  "h-12 rounded-xl border-border/80 bg-background text-[15px]";

export function ManualCertificateForm({ action }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  const [hasCertExpiry, setHasCertExpiry] = useState(false);
  const [validityDays, setValidityDays] = useState<number | "custom">(365);
  const [customDays, setCustomDays] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (!state) return;
    if (state.error) toast.error(state.error);
    else if (state.success) {
      toast.success("Certificado manual creado");
      router.push("/admin/certificates");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* ── Sección 1: Datos del titular ──────────────────────── */}
      <section className={sectionCardClassName}>
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <UserIcon className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Datos del titular</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              La empresa aparece arriba del nombre en el certificado. El DNI debajo.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="holderCompany" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
              <Building2 className="size-3.5" /> Empresa
            </Label>
            <Input
              id="holderCompany"
              name="holderCompany"
              maxLength={100}
              placeholder="Ej. ACME S.A."
              className={controlClassName}
            />
            <p className="text-xs text-muted-foreground">Opcional. Aparece encima del nombre.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="holderName" className={fieldLabelClassName}>
              Nombre completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="holderName"
              name="holderName"
              required
              minLength={3}
              maxLength={120}
              placeholder="Ej. Juan Pérez García"
              className={controlClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holderDni" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
              <IdCard className="size-3.5" /> DNI
            </Label>
            <Input
              id="holderDni"
              name="holderDni"
              inputMode="numeric"
              pattern="\d{6,12}"
              maxLength={12}
              placeholder="Ej. 12345678"
              className={controlClassName}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Entre 6 y 12 dígitos.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sección 2: Título y descripción ───────────────────── */}
      <section className={sectionCardClassName}>
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Título y descripción</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Redacta el título del certificado y el texto que aparecerá en el PDF.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificateTitle" className={fieldLabelClassName}>
              Título del certificado <span className="text-destructive">*</span>
            </Label>
            <Input
              id="certificateTitle"
              name="certificateTitle"
              required
              minLength={3}
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Certificado de Auditor Interno ISO 9001"
              className={controlClassName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customDescription" className={`${fieldLabelClassName} flex items-center gap-1.5`}>
              <FileText className="size-3.5" /> Descripción del certificado
            </Label>
            <Textarea
              id="customDescription"
              name="customDescription"
              rows={4}
              maxLength={400}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              placeholder={
                "Texto que aparecerá bajo el título en el PDF"
              }
              className="resize-none rounded-xl border-border/80 bg-background text-[15px]"
            />
            <p className="text-xs text-muted-foreground">
              Si lo dejas vacío se usará el texto por defecto del sistema. Máximo 400 caracteres.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sección 3: Vigencia ─────────────────────────────── */}
      <section className={sectionCardClassName}>
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <CalendarDays className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Vigencia del certificado</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Define si el certificado tendrá vencimiento.
            </p>
          </div>
        </div>

        <input
          type="hidden"
          name="certificateValidityDays"
          value={hasCertExpiry ? (validityDays === "custom" ? customDays : String(validityDays)) : ""}
        />

        <div className="space-y-4">
          <div className="h-12 flex items-center gap-3 rounded-xl border border-input bg-accent/30 px-4">
            <Switch
              id="hasCertExpiry"
              checked={hasCertExpiry}
              onCheckedChange={setHasCertExpiry}
            />
            <Label htmlFor="hasCertExpiry" className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              {hasCertExpiry ? (
                <>
                  <CalendarDays className="size-3.5 text-primary" />
                  Con vencimiento
                </>
              ) : (
                <>
                  <CalendarDays className="size-3.5 text-muted-foreground" />
                  Sin vencimiento
                </>
              )}
            </Label>
          </div>

          {hasCertExpiry && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="validitySelect" className={fieldLabelClassName}>
                  Duración de la vigencia
                </Label>
                <Select
                  value={String(validityDays)}
                  onValueChange={(v) => setValidityDays(v === "custom" ? "custom" : Number(v))}
                >
                  <SelectTrigger id="validitySelect" className={`${controlClassName} w-full`}>
                    <SelectValue placeholder="Selecciona una opción">
                      {(value) => {
                        if (!value) return "Selecciona una opción";
                        if (value === "custom") return "Días personalizados";
                        const option = VALIDITY_OPTIONS.find((o) => String(o.value) === String(value));
                        return option?.label ?? String(value);
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {VALIDITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Días personalizados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {validityDays === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="customDays" className={fieldLabelClassName}>
                    Días de validez
                  </Label>
                  <div className="relative">
                    <Input
                      id="customDays"
                      type="number"
                      min="1"
                      max="3650"
                      step="1"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="Ej. 545"
                      className={`${controlClassName} pr-14`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      días
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Entre 1 y 3650 días.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
        <Button
          type="submit"
          disabled={pending || title.trim().length < 3}
          className="h-12 rounded-xl px-7 text-[15px] font-semibold"
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
    </form>
  );
}
