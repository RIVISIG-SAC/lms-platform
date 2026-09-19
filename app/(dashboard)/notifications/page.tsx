import { Bell } from "lucide-react";
import { getUnreadCount, listNotifications } from "@/app/actions/notifications";
import { getEnumParam, type SearchParamsRecord } from "@/lib/pagination";
import { NOTIFICATION_TYPES } from "@/lib/notifications-ui";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { NotificationsInbox } from "@/components/notifications/NotificationsInbox";

export const metadata = { title: "Notificaciones" };

const PAGE_SIZE = 20;

type SearchParams = Promise<SearchParamsRecord>;

export default async function NotificationsPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const filter = getEnumParam(searchParams, "filter", ["unread", "read"] as const);
  const selectedType = getEnumParam(searchParams, "type", NOTIFICATION_TYPES);

  const status = filter === "all" ? undefined : filter;
  const type = selectedType === "all" ? undefined : selectedType;

  const [page, totalUnread] = await Promise.all([
    listNotifications({ status, type, pageSize: PAGE_SIZE }),
    getUnreadCount(),
  ]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      {/* Al cambiar de filtro la clave cambia y la bandeja se remonta con los
          datos que acaba de traer el servidor, sin arrastrar estado antiguo. */}
      <NotificationsInbox
        key={`${filter}:${selectedType}`}
        initialItems={page.items}
        initialHasMore={page.nextCursor !== null}
        initialUnread={totalUnread}
        pageSize={PAGE_SIZE}
        status={status}
        type={type}
      />
    </div>
  );
}
