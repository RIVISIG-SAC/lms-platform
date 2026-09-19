"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { Notification } from "@prisma/client";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteNotification,
  deleteReadNotifications,
  listNotifications,
  markAllAsRead,
  markAsRead,
  markAsUnread,
} from "@/app/actions/notifications";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_TYPE_LABELS,
  groupNotificationsByDate,
} from "@/lib/notifications-ui";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { FilterSelect } from "@/components/admin/filters/FilterSelect";
import { SegmentedFilter } from "@/components/admin/filters/SegmentedFilter";
import { ClearFiltersButton } from "@/components/admin/filters/ClearFiltersButton";
import { NotificationRow } from "@/components/notifications/NotificationRow";

type Status = "unread" | "read" | undefined;

type Props = {
  initialItems: Notification[];
  initialHasMore: boolean;
  initialUnread: number;
  pageSize: number;
  status: Status;
  type?: string;
};

type InboxState = { items: Notification[]; unread: number };

type InboxAction =
  | { kind: "setRead"; id: string; read: boolean }
  | { kind: "remove"; id: string; wasUnread: boolean }
  | { kind: "readAll" };

function applyAction(state: InboxState, action: InboxAction): InboxState {
  switch (action.kind) {
    case "setRead":
      return {
        items: state.items.map((item) =>
          item.id === action.id
            ? { ...item, read: action.read, readAt: action.read ? new Date() : null }
            : item,
        ),
        unread: Math.max(0, state.unread + (action.read ? -1 : 1)),
      };
    case "remove":
      return {
        items: state.items.filter((item) => item.id !== action.id),
        unread: Math.max(0, state.unread - (action.wasUnread ? 1 : 0)),
      };
    case "readAll":
      return {
        items: state.items.map((item) =>
          item.read ? item : { ...item, read: true, readAt: new Date() },
        ),
        unread: 0,
      };
  }
}

/**
 * Bandeja de notificaciones.
 *
 * Los filtros viven en la URL: al cambiarlos la página vuelve a consultar la BD
 * y remonta este componente. En cambio, las acciones sobre una notificación se
 * resuelven aquí con estado optimista, para no perder las páginas ya traídas
 * con "Cargar más" ni esperar al servidor en cada clic.
 */
export function NotificationsInbox({
  initialItems,
  initialHasMore,
  initialUnread,
  pageSize,
  status,
  type,
}: Props) {
  const [state, setState] = useState<InboxState>({
    items: initialItems,
    unread: initialUnread,
  });
  // Se guarda si quedan más páginas, no el cursor: el cursor se deduce del
  // último elemento cargado, que tras un borrado sigue existiendo en la BD.
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pending, startTransition] = useTransition();
  const [optimistic, addOptimistic] = useOptimistic(state, applyAction);

  const hasFilters = Boolean(status || type);
  const hasReadItems = optimistic.items.some((item) => item.read);
  const groups = groupNotificationsByDate(optimistic.items);

  function handleToggleRead(notification: Notification) {
    const read = !notification.read;
    const action: InboxAction = { kind: "setRead", id: notification.id, read };

    startTransition(async () => {
      addOptimistic(action);
      try {
        if (read) await markAsRead(notification.id);
        else await markAsUnread(notification.id);
        setState((current) => applyAction(current, action));
      } catch {
        toast.error("No se pudo actualizar la notificación.");
      }
    });
  }

  function handleDelete(notification: Notification) {
    const action: InboxAction = {
      kind: "remove",
      id: notification.id,
      wasUnread: !notification.read,
    };

    startTransition(async () => {
      addOptimistic(action);
      try {
        await deleteNotification(notification.id);
        setState((current) => applyAction(current, action));
        toast.success("Notificación eliminada.");
      } catch {
        toast.error("No se pudo eliminar la notificación.");
      }
    });
  }

  function handleMarkAllAsRead() {
    startTransition(async () => {
      addOptimistic({ kind: "readAll" });
      try {
        await markAllAsRead();
        setState((current) => applyAction(current, { kind: "readAll" }));
      } catch {
        toast.error("No se pudieron marcar las notificaciones.");
      }
    });
  }

  async function handleDeleteRead() {
    const result = await deleteReadNotifications();
    setState((current) => ({
      items: current.items.filter((item) => !item.read),
      unread: current.unread,
    }));
    return result;
  }

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const last = state.items[state.items.length - 1];
      const page = await listNotifications({
        cursor: last?.id,
        status,
        type,
        pageSize,
      });
      setState((current) => ({
        ...current,
        items: [...current.items, ...page.items],
      }));
      setHasMore(page.nextCursor !== null);
    } catch {
      toast.error("No se pudieron cargar más notificaciones.");
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedFilter
            param="filter"
            options={[
              { value: "all", label: "Todas" },
              {
                value: "unread",
                label:
                  optimistic.unread > 0
                    ? `No leídas (${optimistic.unread})`
                    : "No leídas",
              },
              { value: "read", label: "Leídas" },
            ]}
          />
          <FilterSelect
            param="type"
            allLabel="Todos los tipos"
            options={NOTIFICATION_TYPES.map((value) => ({
              value,
              label: NOTIFICATION_TYPE_LABELS[value],
            }))}
          />
          {hasFilters && <ClearFiltersButton params={["filter", "type"]} />}
        </div>

        <div className="flex items-center gap-2">
          {optimistic.unread > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={pending}
            >
              <CheckCheck className="size-3.5" />
              Marcar todas como leídas
            </Button>
          )}
          {hasReadItems && (
            <DeleteConfirmDialog
              action={handleDeleteRead}
              triggerLabel="Eliminar leídas"
              title="¿Eliminar las notificaciones leídas?"
              description="Se borrarán todas tus notificaciones ya leídas, incluidas las que no estés viendo ahora. Esta acción no se puede deshacer."
              confirmLabel="Eliminar leídas"
              successMessage="Notificaciones leídas eliminadas."
            />
          )}
        </div>
      </div>

      {optimistic.items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={
            hasFilters
              ? "Ninguna notificación coincide con los filtros"
              : "Aún no tienes notificaciones"
          }
          description={
            hasFilters
              ? "Prueba con otro tipo o quita los filtros aplicados."
              : "Aquí aparecerán los avisos de tus cursos, pagos y certificados."
          }
          action={
            hasFilters ? <ClearFiltersButton params={["filter", "type"]} /> : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.key} className="flex flex-col gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </h2>
              <ul className="rounded-xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border/60">
                {group.items.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onToggleRead={handleToggleRead}
                    onDelete={handleDelete}
                    onOpen={(item) => {
                      if (!item.read) handleToggleRead(item);
                    }}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Cargando...
              </>
            ) : (
              "Cargar más"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
