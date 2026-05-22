import Link from "next/link";
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
import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { markAllAsRead } from "@/app/actions/notifications";
import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Notificaciones" };

type SearchParams = Promise<{ filter?: string }>;

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

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function NotificationsPage(props: { searchParams: SearchParams }) {
  const session = await getRequiredSession();
  const { filter } = await props.searchParams;
  const onlyUnread = filter === "unread";

  const [items, totalUnread] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId: session.userId,
        ...(onlyUnread ? { read: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: session.userId, read: false },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Notificaciones
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
          <Bell className="size-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notificaciones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalUnread > 0
              ? `${totalUnread} sin leer`
              : "Estás al día con tus notificaciones"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5 text-xs font-medium">
          <Link
            href="/notifications"
            className={cn(
              "px-3 py-1.5 rounded-md transition-colors",
              !onlyUnread
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todas
          </Link>
          <Link
            href="/notifications?filter=unread"
            className={cn(
              "px-3 py-1.5 rounded-md transition-colors",
              onlyUnread
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            No leídas {totalUnread > 0 && `(${totalUnread})`}
          </Link>
        </div>
        {totalUnread > 0 && (
          <form
            action={async () => {
              "use server";
              await markAllAsRead();
            }}
          >
            <button
              type="submit"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "gap-2",
              )}
            >
              <CheckCheck className="size-3.5" />
              Marcar todas como leídas
            </button>
          </form>
        )}
      </div>

      {items.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-border/60 rounded-2xl">
          <Bell className="size-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm font-semibold text-muted-foreground">
            {onlyUnread
              ? "No tienes notificaciones sin leer."
              : "Aún no tienes notificaciones."}
          </p>
        </div>
      ) : (
        <ul className="rounded-xl border border-border bg-card shadow-sm overflow-hidden divide-y divide-border/60">
          {items.map((n) => {
            const Icon = typeIcon[n.type] ?? Info;
            const body = (
              <div className="flex gap-4 px-5 py-4">
                <div
                  className={cn(
                    "shrink-0 size-10 rounded-full flex items-center justify-center",
                    n.read
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        n.read
                          ? "text-muted-foreground"
                          : "text-foreground font-semibold",
                      )}
                    >
                      {n.title}
                    </p>
                    {!n.read && (
                      <span
                        className="shrink-0 mt-1.5 size-2 rounded-full bg-primary"
                        aria-label="No leída"
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {n.message}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-2 uppercase tracking-wider font-medium">
                    {formatLongDate(n.createdAt)}
                  </p>
                </div>
              </div>
            );

            return (
              <li key={n.id}>
                {n.link ? (
                  <Link
                    href={n.link}
                    className="block hover:bg-accent/40 transition-colors"
                  >
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
