"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { Notification } from "@prisma/client";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteNotification,
  getRecentNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  markAsUnread,
} from "@/app/actions/notifications";
import { NotificationRow } from "@/components/notifications/NotificationRow";

const POLL_INTERVAL_MS = 60_000;

export function NotificationBell() {
  const [unread, setUnread] = useState<number>(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    try {
      const [count, recent] = await Promise.all([
        getUnreadCount(),
        getRecentNotifications(10),
      ]);
      setUnread(count);
      setItems(recent);
    } catch (err) {
      console.error("[NotificationBell] refresh failed:", err);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const handleMarkAllRead = () => {
    setItems((current) =>
      current.map((item) =>
        item.read ? item : { ...item, read: true, readAt: new Date() },
      ),
    );
    setUnread(0);
    startTransition(async () => {
      try {
        await markAllAsRead();
      } catch {
        toast.error("No se pudieron marcar las notificaciones.");
        await refresh();
      }
    });
  };

  // El estado se actualiza antes de llamar al servidor; si la acción falla se
  // vuelve a pedir la lista, que es la única fuente de verdad.
  const handleToggleRead = (notification: Notification) => {
    const read = !notification.read;
    setItems((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, read, readAt: read ? new Date() : null }
          : item,
      ),
    );
    setUnread((count) => Math.max(0, count + (read ? -1 : 1)));

    startTransition(async () => {
      try {
        if (read) await markAsRead(notification.id);
        else await markAsUnread(notification.id);
      } catch {
        toast.error("No se pudo actualizar la notificación.");
        await refresh();
      }
    });
  };

  const handleDelete = (notification: Notification) => {
    setItems((current) => current.filter((item) => item.id !== notification.id));
    if (!notification.read) setUnread((count) => Math.max(0, count - 1));

    startTransition(async () => {
      try {
        await deleteNotification(notification.id);
      } catch {
        toast.error("No se pudo eliminar la notificación.");
        await refresh();
      }
    });
  };

  const handleOpen = (notification: Notification) => {
    if (!notification.read) handleToggleRead(notification);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className="relative inline-flex items-center justify-center size-9 rounded-full hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring outline-none transition-colors cursor-pointer data-popup-open:bg-accent/60"
        aria-label={`Notificaciones${unread > 0 ? `, ${unread} sin leer` : ""}`}
      >
        <Bell className="size-5 text-muted-foreground" aria-hidden="true" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center leading-none"
            aria-hidden="true"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-80 sm:w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Notificaciones</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={pending}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Marcar todas
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell
                className="size-6 mx-auto text-muted-foreground/40 mb-2"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones por ahora.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  variant="bell"
                  onToggleRead={handleToggleRead}
                  onDelete={handleDelete}
                  onOpen={handleOpen}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-sm font-medium text-primary hover:bg-accent/40 transition-colors"
          >
            Ver todas
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
