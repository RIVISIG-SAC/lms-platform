"use client";

import { useTransition } from "react";
import {
  BookOpen,
  Check,
  CircleSlash,
  Inbox,
  Mail,
  MailWarning,
  RotateCcw,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";
import { updateSupportMessageStatus } from "@/app/actions/support";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { SearchInput } from "@/components/admin/filters/SearchInput";
import { FilterSelect } from "@/components/admin/filters/FilterSelect";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import {
  SUPPORT_STATUS_LABELS,
  type SupportStatus,
} from "@/lib/validations/support";
import { cn, formatDate } from "@/lib/utils";
import type { PaginationMeta } from "@/lib/pagination";

export type SupportMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: SupportStatus;
  courseTitle: string | null;
  emailSent: boolean;
  createdAt: Date;
  answeredAt: Date | null;
  user: { id: string } | null;
};

const STATUS_OPTIONS = (
  Object.keys(SUPPORT_STATUS_LABELS) as SupportStatus[]
).map((value) => ({ value, label: SUPPORT_STATUS_LABELS[value] }));

const STATUS_BADGE: Record<SupportStatus, string> = {
  OPEN: "bg-amber-100 text-amber-800 border-amber-200",
  ANSWERED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CLOSED: "bg-muted text-muted-foreground border-border",
};

const FILTER_PARAMS = ["q", "status"];

type Props = {
  messages: SupportMessageRow[];
  meta: PaginationMeta;
  hasFilters: boolean;
};

export function SupportMessagesTable({ messages, meta, hasFilters }: Props) {
  const [pending, startTransition] = useTransition();

  function cambiarEstado(id: string, status: SupportStatus) {
    startTransition(async () => {
      const res = await updateSupportMessageStatus(id, status);
      if (res?.error) toast.error(res.error);
      else toast.success(`Marcada como ${SUPPORT_STATUS_LABELS[status].toLowerCase()}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm md:flex-row md:items-center md:justify-between">
        <SearchInput
          placeholder="Buscar por remitente, correo, asunto o curso…"
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
          {hasFilters && (
            <ClearFiltersButton params={FILTER_PARAMS} label="Limpiar" />
          )}
        </div>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : Inbox}
          title={
            hasFilters
              ? "Ninguna consulta coincide"
              : "No hay consultas de soporte"
          }
          description={
            hasFilters
              ? "Prueba con otro remitente, asunto o estado."
              : "Aquí aparecerán los mensajes que los estudiantes envíen desde «Contactar tutor» en su panel."
          }
          action={
            hasFilters ? <ClearFiltersButton params={FILTER_PARAMS} /> : undefined
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={cn(
                  "rounded-2xl border bg-card p-4 shadow-sm sm:p-5",
                  msg.status === "OPEN" ? "border-amber-200" : "border-border",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{msg.subject}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        {msg.name}
                      </span>{" "}
                      · {msg.email} · {formatDate(msg.createdAt)}
                    </p>
                    {msg.courseTitle && (
                      <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                        <BookOpen className="size-3 text-primary" />
                        {msg.courseTitle}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {!msg.emailSent && (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive"
                        title="La consulta se guardó, pero el correo de aviso no pudo enviarse"
                      >
                        <MailWarning className="size-3" />
                        Sin correo
                      </span>
                    )}
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase",
                        STATUS_BADGE[msg.status],
                      )}
                    >
                      {SUPPORT_STATUS_LABELS[msg.status]}
                    </span>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                  {msg.message}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={
                      <a
                        href={`mailto:${msg.email}?subject=${encodeURIComponent(
                          `Re: ${msg.subject}`,
                        )}`}
                      />
                    }
                  >
                    <Mail className="size-3.5" /> Responder
                  </Button>

                  {msg.status !== "ANSWERED" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => cambiarEstado(msg.id, "ANSWERED")}
                    >
                      <Check className="size-3.5" /> Marcar respondida
                    </Button>
                  )}

                  {msg.status !== "CLOSED" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => cambiarEstado(msg.id, "CLOSED")}
                    >
                      <CircleSlash className="size-3.5" /> Cerrar
                    </Button>
                  )}

                  {msg.status !== "OPEN" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => cambiarEstado(msg.id, "OPEN")}
                    >
                      <RotateCcw className="size-3.5" /> Reabrir
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <Pagination meta={meta} itemLabel={{ one: "consulta", many: "consultas" }} />
        </>
      )}
    </div>
  );
}
