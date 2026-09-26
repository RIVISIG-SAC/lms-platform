"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  CreditCard,
  Loader2,
  PackageCheck,
  RotateCcw,
  SearchX,
  TriangleAlert,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { refundPayment, retryPaymentFulfillment } from "@/app/actions/payments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { SearchInput } from "@/components/admin/filters/SearchInput";
import { FilterSelect } from "@/components/admin/filters/FilterSelect";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import { useTableParams } from "@/components/admin/filters/use-table-params";
import { CONTROL_ADMIN } from "@/components/admin/form-styles";
import { cn, formatDate } from "@/lib/utils";
import type { PaginationMeta } from "@/lib/pagination";

type Status = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
type Kind = "COURSE" | "CERTIFICATE";

export type PaymentRow = {
  id: string;
  kind: Kind;
  status: Status;
  amount: string;
  userName: string;
  userEmail: string;
  courseTitle: string;
  chargeId: string | null;
  failureMessage: string | null;
  createdAt: Date;
  paidAt: Date | null;
  refundedAt: Date | null;
  fulfilled: boolean;
  /** PENDING con demasiado tiempo: el proceso se cortó antes de confirmar. */
  stale: boolean;
};

const STATUS_LABELS: Record<Status, string> = {
  PENDING: "En proceso",
  PAID: "Cobrado",
  FAILED: "Rechazado",
  REFUNDED: "Reembolsado",
};

const STATUS_BADGE: Record<Status, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  REFUNDED: "bg-amber-100 text-amber-800 border-amber-200",
};

const KIND_LABELS: Record<Kind, string> = {
  COURSE: "Curso",
  CERTIFICATE: "Certificado",
};

const STATUS_OPTIONS = [
  ...(Object.keys(STATUS_LABELS) as Status[]).map((value) => ({
    value,
    label: STATUS_LABELS[value],
  })),
  { value: "UNFULFILLED", label: "Cobrado sin entregar" },
];

const KIND_OPTIONS = (Object.keys(KIND_LABELS) as Kind[]).map((value) => ({
  value,
  label: KIND_LABELS[value],
}));

const REFUND_REASONS = [
  { value: "solicitud_comprador", label: "Solicitud del comprador" },
  { value: "duplicidad", label: "Cobro duplicado" },
  { value: "fraudulento", label: "Fraude" },
];

const FILTER_PARAMS = ["q", "status", "kind"];

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function RetryFulfillmentButton({ paymentId }: { paymentId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await retryPaymentFulfillment(paymentId);
      if (result.error) toast.error(result.error);
      else toast.success("Acceso entregado al alumno");
    });
  }

  return (
    <Button type="button" size="sm" onClick={handleClick} disabled={pending}>
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <RotateCcw className="size-3.5" />}
      Entregar
    </Button>
  );
}

function RefundDialog({ payment }: { payment: PaymentRow }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(refundPayment, null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    else if (state?.success) {
      toast.success("Reembolso realizado en Culqi");
      setOpen(false);
    }
  }, [state]);

  const revokeLabel =
    payment.kind === "COURSE" ? "Retirar el acceso al curso" : "Revocar el certificado";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Undo2 className="size-3.5" />
            Reembolsar
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form action={action} className="space-y-4">
          <DialogHeader>
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <TriangleAlert className="size-5 text-destructive" />
            </div>
            <DialogTitle>Reembolsar S/ {payment.amount}</DialogTitle>
            <DialogDescription>
              Se devolverá el total a {payment.userName} por «{payment.courseTitle}» a
              través de Culqi. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <input type="hidden" name="paymentId" value={payment.id} />

          <div className="space-y-1.5">
            <label htmlFor={`reason-${payment.id}`} className="text-xs font-semibold text-muted-foreground">
              Motivo
            </label>
            <select
              id={`reason-${payment.id}`}
              name="reason"
              required
              defaultValue="solicitud_comprador"
              className={cn(CONTROL_ADMIN, "w-full border px-3")}
            >
              {REFUND_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-2.5 text-sm text-foreground">
            <input type="checkbox" name="revokeAccess" defaultChecked className="mt-0.5 size-4 accent-primary" />
            <span>
              {revokeLabel}
              <span className="block text-xs text-muted-foreground">
                Desmárcalo si el reembolso es una excepción comercial.
              </span>
            </span>
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Confirmar reembolso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type Props = {
  payments: PaymentRow[];
  meta: PaginationMeta;
  unfulfilledCount: number;
  hasFilters: boolean;
};

export function PaymentsTable({ payments, meta, unfulfilledCount, hasFilters }: Props) {
  const { setParams } = useTableParams();

  return (
    <div className="space-y-4">
      {unfulfilledCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-destructive">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              <strong>
                {unfulfilledCount} {unfulfilledCount === 1 ? "pago cobrado" : "pagos cobrados"}
              </strong>{" "}
              sin acceso entregado. El alumno pagó y está esperando.
            </span>
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => setParams({ status: "UNFULFILLED" })}
          >
            Ver pendientes
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <SearchInput
          placeholder="Buscar por alumno, correo, curso o ID de cargo…"
          className="md:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            param="status"
            options={STATUS_OPTIONS}
            allLabel="Todos los estados"
            placeholder="Estado"
            className="h-9 min-w-[170px]"
          />
          <FilterSelect
            param="kind"
            options={KIND_OPTIONS}
            allLabel="Cursos y certificados"
            placeholder="Tipo"
            className="h-9 min-w-[170px]"
          />
          {hasFilters && <ClearFiltersButton params={FILTER_PARAMS} label="Limpiar" />}
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : CreditCard}
          title={hasFilters ? "Ningún pago coincide" : "Aún no hay pagos"}
          description={
            hasFilters
              ? "Prueba con otro alumno, curso o estado."
              : "Aquí aparecerá cada cobro hecho con Culqi, incluidos los rechazados."
          }
          action={hasFilters ? <ClearFiltersButton params={FILTER_PARAMS} /> : undefined}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Fecha</th>
                    <th className="px-4 py-3 text-left">Alumno</th>
                    <th className="px-4 py-3 text-left">Concepto</th>
                    <th className="px-4 py-3 text-right">Monto</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">ID de cargo</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {payments.map((p) => {
                    const unfulfilled = p.status === "PAID" && !p.fulfilled;
                    return (
                      <tr
                        key={p.id}
                        className={cn(
                          "align-top transition-colors hover:bg-muted/30",
                          unfulfilled && "bg-destructive/5",
                        )}
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {formatDateTime(p.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{p.userName}</div>
                          <div className="text-xs text-muted-foreground">{p.userEmail}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-foreground">{p.courseTitle}</div>
                          <div className="text-xs text-muted-foreground">{KIND_LABELS[p.kind]}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums text-foreground">
                          S/ {p.amount}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                              STATUS_BADGE[p.status],
                            )}
                          >
                            {STATUS_LABELS[p.status]}
                          </span>
                          {unfulfilled && (
                            <p className="mt-1 text-[11px] font-semibold text-destructive">
                              Sin entregar
                            </p>
                          )}
                          {p.status === "PAID" && p.fulfilled && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-700">
                              <PackageCheck className="size-3" /> Entregado
                            </p>
                          )}
                          {p.stale && (
                            <p className="mt-1 max-w-[200px] text-[11px] text-amber-700">
                              Sin confirmación de Culqi. Si hubo cobro, el webhook lo completará.
                            </p>
                          )}
                          {p.status === "FAILED" && p.failureMessage && (
                            <p className="mt-1 max-w-[220px] text-[11px] text-muted-foreground">
                              {p.failureMessage}
                            </p>
                          )}
                          {p.status === "REFUNDED" && p.refundedAt && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {formatDate(p.refundedAt)}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {p.chargeId ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {unfulfilled && <RetryFulfillmentButton paymentId={p.id} />}
                            {p.status === "PAID" && p.chargeId && <RefundDialog payment={p} />}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination meta={meta} itemLabel={{ one: "pago", many: "pagos" }} />
        </>
      )}
    </div>
  );
}
