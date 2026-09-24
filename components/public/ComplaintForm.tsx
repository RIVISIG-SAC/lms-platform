"use client";

import { startTransition, useActionState, useState } from "react";
import { CheckCircle2, Loader2, MailWarning, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  submitComplaint,
  type ComplaintFormState,
} from "@/app/actions/complaints";
import {
  COMPLAINT_DETAIL_MAX,
  COMPLAINT_DOCUMENT_LABELS,
  COMPLAINT_DOCUMENT_TYPES,
  COMPLAINT_RESPONSE_BUSINESS_DAYS,
  COMPLAINT_TYPE_HINTS,
  COMPLAINT_TYPE_LABELS,
  COMPLAINT_TYPES,
} from "@/lib/validations/complaint";
import { cn } from "@/lib/utils";

const CONTROL =
  "h-11 rounded-xl border-border bg-background text-sm focus-visible:border-primary focus-visible:ring-primary/25 aria-invalid:border-destructive";
const AREA =
  "min-h-28 rounded-xl border-border bg-background text-sm focus-visible:border-primary focus-visible:ring-primary/25 aria-invalid:border-destructive";
const SELECT =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/25 aria-invalid:border-destructive";
const CHIP =
  "flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/30 has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40";

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
        {optional && (
          <span className="font-normal text-muted-foreground/60"> (opcional)</span>
        )}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {step}
        </span>
        <p className="text-sm font-bold text-foreground">{title}</p>
      </div>
      {children}
    </fieldset>
  );
}

export function ComplaintForm() {
  const [state, action, pending] = useActionState<ComplaintFormState, FormData>(
    submitComplaint,
    null,
  );
  const [isMinor, setIsMinor] = useState(false);

  if (state && "success" in state) {
    return (
      <div
        role="status"
        className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 text-center sm:p-8"
      >
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-lg font-bold text-foreground">
            Hoja de reclamación registrada
          </p>
          <p className="text-sm text-muted-foreground">Tu código de registro es</p>
          <p className="font-mono text-2xl font-extrabold tracking-wider text-foreground">
            {state.code}
          </p>
        </div>
        {state.emailSent ? (
          <p className="text-sm text-muted-foreground">
            Enviamos una copia a <strong>{state.email}</strong>. Te responderemos
            a ese correo en un plazo no mayor a {COMPLAINT_RESPONSE_BUSINESS_DAYS}{" "}
            días hábiles.
          </p>
        ) : (
          <p className="inline-flex items-start gap-2 text-left text-sm text-amber-800">
            <MailWarning className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Tu hoja quedó registrada, pero no pudimos enviar la copia a{" "}
            {state.email}. Guarda el código; nuestro equipo te contactará.
          </p>
        )}
      </div>
    );
  }

  const fieldErrors = state && "fieldErrors" in state ? state.fieldErrors ?? {} : {};
  const err = (name: string) => fieldErrors[name];
  const aria = (name: string) =>
    err(name)
      ? { "aria-invalid": true as const, "aria-describedby": `${name}-error` }
      : {};

  // Se envía a mano en vez de con `action={...}`: React reinicia el formulario
  // tras cada envío y, si hay errores, el consumidor perdería todo lo escrito.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => action(formData));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Section step={1} title="Identificación del consumidor reclamante">
        <Field id="consumerName" label="Nombres y apellidos" error={err("consumerName")}>
          <Input
            id="consumerName"
            name="consumerName"
            autoComplete="name"
            maxLength={150}
            required
            className={CONTROL}
            {...aria("consumerName")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_1fr]">
          <Field id="documentType" label="Tipo de documento" error={err("documentType")}>
            <select
              id="documentType"
              name="documentType"
              defaultValue="DNI"
              className={SELECT}
              {...aria("documentType")}
            >
              {COMPLAINT_DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {COMPLAINT_DOCUMENT_LABELS[type]}
                </option>
              ))}
            </select>
          </Field>
          <Field id="documentNumber" label="Número de documento" error={err("documentNumber")}>
            <Input
              id="documentNumber"
              name="documentNumber"
              autoComplete="off"
              maxLength={12}
              required
              className={CONTROL}
              {...aria("documentNumber")}
            />
          </Field>
        </div>

        <Field id="address" label="Domicilio" error={err("address")}>
          <Input
            id="address"
            name="address"
            autoComplete="street-address"
            maxLength={250}
            required
            className={CONTROL}
            {...aria("address")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="phone" label="Teléfono" error={err("phone")}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={20}
              required
              className={CONTROL}
              {...aria("phone")}
            />
          </Field>
          <Field
            id="email"
            label="Correo electrónico"
            error={err("email")}
            hint="Aquí recibirás la copia de tu hoja y nuestra respuesta."
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={150}
              required
              className={CONTROL}
              {...aria("email")}
            />
          </Field>
        </div>

        <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground">
          <input
            type="checkbox"
            name="isMinor"
            checked={isMinor}
            onChange={(e) => setIsMinor(e.target.checked)}
            className="size-4 shrink-0 cursor-pointer rounded accent-primary"
          />
          Soy menor de edad
        </label>

        {isMinor && (
          <Field
            id="guardianName"
            label="Nombre del padre, madre o apoderado"
            error={err("guardianName")}
          >
            <Input
              id="guardianName"
              name="guardianName"
              maxLength={150}
              required
              className={CONTROL}
              {...aria("guardianName")}
            />
          </Field>
        )}
      </Section>

      <Section step={2} title="Identificación del bien contratado">
        <div
          role="radiogroup"
          aria-label="Tipo de bien contratado"
          aria-invalid={Boolean(err("itemType")) || undefined}
          className="grid gap-3 sm:grid-cols-2"
        >
          {(["SERVICIO", "PRODUCTO"] as const).map((value) => (
            <label key={value} className={cn(CHIP, "items-center")}>
              <input
                type="radio"
                name="itemType"
                value={value}
                defaultChecked={value === "SERVICIO"}
                className="size-4 accent-primary"
              />
              <span className="text-sm font-semibold">
                {value === "SERVICIO" ? "Servicio" : "Producto"}
              </span>
            </label>
          ))}
        </div>
        {err("itemType") && (
          <p className="text-xs font-medium text-destructive">{err("itemType")}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_1fr]">
          <Field
            id="amount"
            label="Monto reclamado (S/)"
            optional
            error={err("amount")}
          >
            <Input
              id="amount"
              name="amount"
              inputMode="decimal"
              placeholder="0.00"
              maxLength={11}
              className={CONTROL}
              {...aria("amount")}
            />
          </Field>
          <Field
            id="itemDescription"
            label="Descripción"
            error={err("itemDescription")}
            hint="Por ejemplo: nombre del curso o del certificado adquirido."
          >
            <Input
              id="itemDescription"
              name="itemDescription"
              maxLength={500}
              required
              className={CONTROL}
              {...aria("itemDescription")}
            />
          </Field>
        </div>
      </Section>

      <Section step={3} title="Detalle de la reclamación y pedido del consumidor">
        <div
          role="radiogroup"
          aria-label="Tipo de reclamación"
          className="grid gap-3 sm:grid-cols-2"
        >
          {COMPLAINT_TYPES.map((value) => (
            <label key={value} className={CHIP}>
              <input
                type="radio"
                name="type"
                value={value}
                required
                className="mt-0.5 size-4 shrink-0 accent-primary"
              />
              <span className="space-y-0.5">
                <span className="block text-sm font-semibold">
                  {COMPLAINT_TYPE_LABELS[value]}
                </span>
                <span className="block text-xs leading-relaxed text-muted-foreground">
                  {COMPLAINT_TYPE_HINTS[value]}
                </span>
              </span>
            </label>
          ))}
        </div>
        {err("type") && (
          <p className="text-xs font-medium text-destructive">{err("type")}</p>
        )}

        <Field id="detail" label="Detalle" error={err("detail")}>
          <Textarea
            id="detail"
            name="detail"
            maxLength={COMPLAINT_DETAIL_MAX}
            required
            className={AREA}
            {...aria("detail")}
          />
        </Field>

        <Field
          id="request"
          label="Pedido"
          error={err("request")}
          hint="¿Qué solución esperas?"
        >
          <Textarea
            id="request"
            name="request"
            maxLength={COMPLAINT_DETAIL_MAX}
            required
            className={AREA}
            {...aria("request")}
          />
        </Field>
      </Section>

      <div className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/30 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40">
          <input
            type="checkbox"
            name="acceptTerms"
            required
            className="mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-primary"
          />
          <span className="text-xs leading-relaxed text-muted-foreground">
            Declaro que la información proporcionada es verdadera. El envío de
            este formulario equivale a mi firma en la hoja de reclamación.
          </span>
        </label>
        {err("acceptTerms") && (
          <p className="text-xs font-medium text-destructive">{err("acceptTerms")}</p>
        )}

        {state && "error" in state && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {state.error}
          </p>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full text-sm font-bold sm:w-auto sm:px-8"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Enviar hoja de reclamación
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
