import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LifeBuoy } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { SupportMessagesTable } from "@/components/admin/SupportMessagesTable";
import { SUPPORT_STATUSES } from "@/lib/validations/support";
import {
  buildPagination,
  getEnumParam,
  getPageSize,
  getRequestedPage,
  getSearchParam,
  type SearchParamsRecord,
} from "@/lib/pagination";

export const metadata = { title: "Soporte | Admin" };

export default async function AdminSupportPage(props: {
  searchParams: Promise<unknown>;
}) {
  const sp = (await props.searchParams) as SearchParamsRecord;
  const q = getSearchParam(sp, "q");
  const status = getEnumParam(sp, "status", SUPPORT_STATUSES);

  const where: Prisma.SupportMessageWhereInput = {
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
            { courseTitle: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalItems, openCount, failedEmails] = await Promise.all([
    prisma.supportMessage.count({ where }),
    prisma.supportMessage.count({ where: { status: "OPEN" } }),
    prisma.supportMessage.count({ where: { emailSent: false } }),
  ]);

  const meta = buildPagination({
    requestedPage: getRequestedPage(sp),
    pageSize: getPageSize(sp),
    totalItems,
  });

  const messages = await prisma.supportMessage.findMany({
    where,
    // Lo pendiente primero: es una bandeja de trabajo, no un histórico.
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    skip: meta.skip,
    take: meta.pageSize,
    select: {
      id: true,
      name: true,
      email: true,
      subject: true,
      message: true,
      status: true,
      courseTitle: true,
      emailSent: true,
      createdAt: true,
      answeredAt: true,
      user: { select: { id: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case font-medium tracking-normal">
              Soporte
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
          <LifeBuoy className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Consultas de estudiantes
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {openCount} {openCount === 1 ? "pendiente" : "pendientes"}
            {failedEmails > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-destructive">
                  {failedEmails} sin aviso por correo
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <SupportMessagesTable
        messages={messages}
        meta={meta}
        hasFilters={Boolean(q) || status !== "all"}
      />
    </div>
  );
}
