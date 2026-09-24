import type { Prisma } from "@prisma/client";
import { BookOpenText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { ComplaintsTable } from "@/components/admin/ComplaintsTable";
import {
  COMPLAINT_DOCUMENT_LABELS,
  COMPLAINT_TYPE_LABELS,
  complaintDeadline,
  formatComplaintCode,
} from "@/lib/validations/complaint";
import {
  buildPagination,
  getEnumParam,
  getPageSize,
  getRequestedPage,
  getSearchParam,
  type SearchParamsRecord,
} from "@/lib/pagination";

export const metadata = { title: "Reclamaciones | Admin" };

const STATUSES = ["PENDING", "ANSWERED"] as const;

export default async function AdminComplaintsPage(props: {
  searchParams: Promise<unknown>;
}) {
  const sp = (await props.searchParams) as SearchParamsRecord;
  const q = getSearchParam(sp, "q");
  const status = getEnumParam(sp, "status", STATUSES);

  // El código visible es LR-<año>-<número>; se busca por el número.
  const codeNumber = q ? Number(q.replace(/^LR-\d{4}-/i, "")) : NaN;

  const where: Prisma.ComplaintWhereInput = {
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            ...(Number.isInteger(codeNumber) && codeNumber > 0
              ? [{ number: codeNumber }]
              : []),
            { consumerName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { documentNumber: { contains: q } },
            { itemDescription: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalItems, pendingCount] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.count({ where: { status: "PENDING" } }),
  ]);

  const meta = buildPagination({
    requestedPage: getRequestedPage(sp),
    pageSize: getPageSize(sp),
    totalItems,
  });

  const complaints = await prisma.complaint.findMany({
    where,
    // Pendientes primero y, entre ellas, la más antigua: es la que vence antes.
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    skip: meta.skip,
    take: meta.pageSize,
  });

  const rows = complaints.map((c) => ({
    id: c.id,
    code: formatComplaintCode(c.number, c.createdAt),
    type: c.type,
    typeLabel: COMPLAINT_TYPE_LABELS[c.type],
    status: c.status,
    consumerName: c.consumerName,
    document: `${COMPLAINT_DOCUMENT_LABELS[c.documentType]} ${c.documentNumber}`,
    address: c.address,
    phone: c.phone,
    email: c.email,
    guardianName: c.guardianName,
    itemType: c.itemType,
    amount: c.amount ? c.amount.toFixed(2) : null,
    itemDescription: c.itemDescription,
    detail: c.detail,
    request: c.request,
    response: c.response,
    createdAt: c.createdAt,
    deadline: complaintDeadline(c.createdAt),
    respondedAt: c.respondedAt,
    receiptEmailSent: c.receiptEmailSent,
    responseEmailSent: c.responseEmailSent,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case font-medium tracking-normal">
              Reclamaciones
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
          <BookOpenText className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Libro de Reclamaciones
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pendingCount} {pendingCount === 1 ? "pendiente" : "pendientes"} de
            respuesta. Las hojas no se pueden editar ni eliminar.
          </p>
        </div>
      </div>

      <ComplaintsTable
        complaints={rows}
        meta={meta}
        hasFilters={Boolean(q) || status !== "all"}
      />
    </div>
  );
}
