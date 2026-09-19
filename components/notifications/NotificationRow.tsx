"use client";

import Link from "next/link";
import type { Notification } from "@prisma/client";
import { Check, Info, Trash2, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NOTIFICATION_TYPE_ICONS,
  formatNotificationDate,
  formatNotificationTimeAgo,
} from "@/lib/notifications-ui";

type Props = {
  notification: Notification;
  /** `bell` compacta la fila para el desplegable del header. */
  variant?: "inbox" | "bell";
  onToggleRead: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  /** Se ejecuta al abrir una notificación con enlace (cierra la campana). */
  onOpen?: (notification: Notification) => void;
};

export function NotificationRow({
  notification: n,
  variant = "inbox",
  onToggleRead,
  onDelete,
  onOpen,
}: Props) {
  const Icon = NOTIFICATION_TYPE_ICONS[n.type] ?? Info;
  const isBell = variant === "bell";

  const content = (
    <>
      <div
        className={cn(
          "shrink-0 rounded-full flex items-center justify-center",
          isBell ? "size-8" : "size-10",
          n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className={isBell ? "size-4" : "size-5"} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          {!n.read && (
            <span
              className="shrink-0 mt-1.5 size-2 rounded-full bg-primary"
              aria-label="No leída"
            />
          )}
          <p
            className={cn(
              "text-sm leading-snug",
              n.read ? "text-muted-foreground" : "text-foreground font-semibold",
            )}
          >
            {n.title}
          </p>
        </div>
        <p
          className={cn(
            "text-muted-foreground mt-0.5",
            isBell ? "text-xs line-clamp-2" : "text-sm",
          )}
        >
          {n.message}
        </p>
        <p
          className={cn(
            "mt-1.5 uppercase tracking-wider font-medium text-muted-foreground/70",
            isBell ? "text-[10px]" : "text-[11px]",
          )}
        >
          {isBell
            ? formatNotificationTimeAgo(n.createdAt)
            : formatNotificationDate(n.createdAt)}
        </p>
      </div>
    </>
  );

  const mainClassName = cn(
    "flex min-w-0 flex-1 text-left",
    isBell ? "gap-3 px-4 py-3" : "gap-4 px-5 py-4",
  );

  return (
    <li
      className={cn(
        "flex items-stretch transition-colors hover:bg-accent/40",
        !n.read && "bg-primary/[0.03]",
      )}
    >
      {n.link ? (
        <Link
          href={n.link}
          onClick={() => onOpen?.(n)}
          className={mainClassName}
        >
          {content}
        </Link>
      ) : !n.read ? (
        // Sin enlace al que ir, el propio cuerpo sirve para darla por leída.
        <button
          type="button"
          onClick={() => onToggleRead(n)}
          className={cn(mainClassName, "cursor-pointer")}
        >
          {content}
        </button>
      ) : (
        <div className={mainClassName}>{content}</div>
      )}

      <div
        className={cn(
          "flex shrink-0 items-start gap-0.5",
          isBell ? "pr-2 pt-3" : "pr-3 pt-4",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onToggleRead(n)}
          aria-label={n.read ? "Marcar como no leída" : "Marcar como leída"}
          title={n.read ? "Marcar como no leída" : "Marcar como leída"}
          className="text-muted-foreground hover:text-foreground"
        >
          {n.read ? <Undo2 className="size-4" /> : <Check className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(n)}
          aria-label="Eliminar notificación"
          title="Eliminar notificación"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}
