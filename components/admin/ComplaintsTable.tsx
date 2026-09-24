"use client";

import { useActionState, useEffect } from "react";
import {
  BookOpenText,
  CalendarClock,
  Loader2,
  MailWarning,
  SearchX,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { respondComplaint } from "@/app/actions/complaints";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { SearchInput } from "@/components/admin/filters/SearchInput";
import { FilterSelect } from "@/components/admin/filters/FilterSelect";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import { AREA_ADMIN } from "@/components/admin/form-styles";
import {
  COMPLAINT_RESPONSE_MAX,
  COMPLAINT_STATUS_LABELS,
} from "@/lib/validations/complaint";
import { cn, formatDate } from "@/lib/utils";
import type { PaginationMeta } from "@/lib/pagination";

type Status = keyof typeof COMPLAINT_STATUS_LABELS;

export type ComplaintRow = {
  id: string;
  code: string;
  type: "RECLAMO" | "QUEJA";
  typeLabel: string;
  status: Status;
  consumerName: string;
  document: string;
  address: string;
  phone: string;
  email: string;
  guardianName: string | null;
  itemType: string;
  amount: string | null;
  itemDescription: string;
  detail: string;
  request: string;
  response: string | null;
  createdAt: Date;
  deadline: Date;
  respondedAt: Date | null;
  receiptEmailSent: boolean;
  responseEmailSent: boolean;
};

const STATUS_OPTIONS = (Object.keys(COMPLAINT_STATUS_LABELS) as Status[]).map(
  (value) => ({ value, label: COMPLAINT_STATUS_LABELS[value] }),
);

const STATUS_BADGE: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  ANSWERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const FILTER_PARAMS = ["q", "status"];

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

function ResponseForm({ complaintId }: { complaintId: string }) {
  const [state, action, pending] = useActionState(respondComplaint, null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.success) {
      if (state.emailSent) toast.success("Respuesta enviada al consumidor");
      else toast.warning("Respuesta guardada, pero el correo no pudo enviarse");
    }
  }, [state]);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="complaintId" value={complaintId} />
      <label
        htmlFor={`response-${complaintId}`}
        className="text-xs font-semibold text-muted-foreground"
      >
        Respuesta y acciones adoptadas
      </label>
      <Textarea
        id={`response-${complaintId}`}
        name="response"
        required
        minLength={10}
        maxLength={COMPLAINT_RESPONSE_MAX}
        rows={5}
        className={AREA_ADMIN}
      />
      <p className="text-[11px] text-muted-foreground">
        Se enviará al correo del consumidor y quedará registrada en la hoja. No
        se puede modificar después.
      </p>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Send className="size-3.5" />
        )}
        Enviar respuesta
      </Button>
    </form>
  );
}

type Props = {
  complaints: ComplaintRow[];
  meta: PaginationMeta;
  hasFilters: boolean;
};

export function ComplaintsTable({ complaints, meta, hasFilters }: Props) {
  const now = new Date();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <SearchInput
          placeholder="Buscar por código, nombre, correo o documento…"
          className="md:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            param="status"
            options={STATUS_OPTIONS}
            allLabel="Todos los estados"
            placeholder="Estado"
            className="h-9 min-w-[160px]"
          />
          {hasFilters && <ClearFiltersButton params={FILTER_PARAMS} label="Limpiar" />}
        </div>
      </div>

      {complaints.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : BookOpenText}
          title={hasFilters ? "Ninguna hoja coincide" : "No hay hojas de reclamación"}
          description={
            hasFilters
              ? "Prueba con otro código, nombre o estado."
              : "Aquí aparecerán las hojas registradas desde /libro-de-reclamaciones."
          }
          action={hasFilters ? <ClearFiltersButton params={FILTER_PARAMS} /> : undefined}
        />
      ) : (
        <>
          <ul className="space-y-3">
            {complaints.map((c) => {
              const vencida = c.status === "PENDING" && c.deadline < now;
              return (
                <li
                  key={c.id}
                  className={cn(
                    "rounded-2xl border bg-card shadow-sm",
                    vencida
                      ? "border-destructive/40"
                      : c.status === "PENDING"
                        ? "border-amber-200"
                        : "border-border",
                  )}
                >
                  <details className="group">
                    <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-bold text-foreground">
                          {c.code}{" "}
                          <span className="font-sans font-semibold text-muted-foreground">
                            · {c.typeLabel}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">
                            {c.consumerName}
                          </span>{" "}
                          · {c.email} · {formatDate(c.createdAt)}
                        </p>
                        {c.status === "PENDING" && (
                          <p
                            className={cn(
                              "mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold",
                              vencida ? "text-destructive" : "text-amber-700",
                            )}
                          >
                            <CalendarClock className="size-3" />
                            {vencida ? "Plazo vencido el " : "Responder antes del "}
                            {formatDate(c.deadline)}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {(!c.receiptEmailSent ||
                          (c.status === "ANSWERED" && !c.responseEmailSent)) && (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive"
                            title="Un correo al consumidor no pudo enviarse; contáctalo manualmente"
                          >
                            <MailWarning className="size-3" />
                            Sin correo
                          </span>
                        )}
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                            STATUS_BADGE[c.status],
                          )}
                        >
                          {COMPLAINT_STATUS_LABELS[c.status]}
                        </span>
                      </div>
                    </summary>

                    <div className="space-y-5 border-t border-border/60 p-4 sm:p-5">
                      <dl className="grid gap-4 sm:grid-cols-2">
                        <Dato label="Documento">{c.document}</Dato>
                        <Dato label="Teléfono">{c.phone}</Dato>
                        <Dato label="Domicilio">{c.address}</Dato>
                        {c.guardianName && (
                          <Dato label="Padre, madre o apoderado">{c.guardianName}</Dato>
                        )}
                        <Dato label="Bien contratado">
                          {c.itemType}: {c.itemDescription}
                        </Dato>
                        <Dato label="Monto reclamado">
                          {c.amount ? `S/ ${c.amount}` : "—"}
                        </Dato>
                      </dl>

                      <div className="space-y-3">
                        <Dato label="Detalle">
                          <span className="whitespace-pre-wrap">{c.detail}</span>
                        </Dato>
                        <Dato label="Pedido">
                          <span className="whitespace-pre-wrap">{c.request}</span>
                        </Dato>
                      </div>

                      {c.status === "ANSWERED" ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                          <Dato
                            label={`Respuesta · ${c.respondedAt ? formatDate(c.respondedAt) : ""}`}
                          >
                            <span className="whitespace-pre-wrap">{c.response}</span>
                          </Dato>
                        </div>
                      ) : (
                        <ResponseForm complaintId={c.id} />
                      )}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>

          <Pagination meta={meta} itemLabel={{ one: "hoja", many: "hojas" }} />
        </>
      )}
    </div>
  );
}
