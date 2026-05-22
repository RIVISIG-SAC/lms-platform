"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { Notification, NotificationType } from "@prisma/client";
import {
  Award,
  Bell,
  CheckCheck,
  Clock,
  CreditCard,
  GraduationCap,
  KeyRound,
  Info,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  getRecentNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/app/actions/notifications";

const POLL_INTERVAL_MS = 60_000;

const typeIcon: Record<NotificationType, React.ElementType> = {
  CERTIFICATE_ISSUED: Award,
  PAYMENT_RECEIVED: CreditCard,
  ENROLLMENT_CONFIRMED: GraduationCap,
  ACCESS_EXPIRING: Clock,
  ACCESS_EXPIRED: Clock,
  PASSWORD_EXPIRING: KeyRound,
  ADMIN_NEW_ENROLLMENT: GraduationCap,
  ADMIN_NEW_PAYMENT: CreditCard,
  ADMIN_CERTIFICATE_ISSUED: Award,
};

function getIcon(type: NotificationType): React.ElementType {
  return typeIcon[type] ?? Info;
}

function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "hace instantes";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
  });
}

export function NotificationBell() {
  const [unread, setUnread] = useState<number>(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

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
    startTransition(async () => {
      await markAllAsRead();
      await refresh();
    });
  };

  const handleItemClick = (id: string, read: boolean) => {
    if (read) return;
    startTransition(async () => {
      await markAsRead(id);
      await refresh();
    });
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
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <CheckCheck className="size-3.5" aria-hidden="true" />
              Marcar todas
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="size-6 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones por ahora.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const Icon = getIcon(n.type);
                const content = (
                  <div className="flex gap-3 px-4 py-3">
                    <div
                      className={cn(
                        "shrink-0 size-8 rounded-full flex items-center justify-center",
                        n.read
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          n.read ? "text-muted-foreground" : "text-foreground font-semibold",
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1.5 uppercase tracking-wider font-medium">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && (
                      <span
                        className="shrink-0 mt-1.5 size-2 rounded-full bg-primary"
                        aria-label="No leída"
                      />
                    )}
                  </div>
                );

                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => {
                          handleItemClick(n.id, n.read);
                          setOpen(false);
                        }}
                        className="block hover:bg-accent/40 transition-colors"
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleItemClick(n.id, n.read)}
                        className="w-full text-left hover:bg-accent/40 transition-colors cursor-pointer"
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
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
