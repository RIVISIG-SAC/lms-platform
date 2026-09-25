import type { Prisma } from "@prisma/client";
import { CreditCard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { PaymentsTable, type PaymentRow } from "@/components/admin/PaymentsTable";
import { formatCurrency } from "@/lib/utils";
import {
  buildPagination,
  getEnumParam,
  getPageSize,
  getRequestedPage,
  getSearchParam,
  type SearchParamsRecord,
} from "@/lib/pagination";

export const metadata = { title: "Pagos | Admin" };

/** `UNFULFILLED` no es un estado de la BD: cobrados cuya entrega no terminó. */
const STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED", "UNFULFILLED"] as const;
const KINDS = ["COURSE", "CERTIFICATE"] as const;

/** Un PENDING más viejo que esto ya no está "en curso": el proceso murió. */
const STALE_PENDING_MS = 10 * 60_000;

export default async function AdminPaymentsPage(props: {
  searchParams: Promise<unknown>;
}) {
  const sp = (await props.searchParams) as SearchParamsRecord;
  const q = getSearchParam(sp, "q");
  const status = getEnumParam(sp, "status", STATUSES);
  const kind = getEnumParam(sp, "kind", KINDS);

  const where: Prisma.PaymentWhereInput = {
    ...(status === "UNFULFILLED"
      ? { status: "PAID", fulfilledAt: null }
      : status !== "all"
        ? { status }
        : {}),
    ...(kind !== "all" ? { kind } : {}),
    ...(q
      ? {
          OR: [
            { culqiChargeId: { contains: q } },
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
            { course: { title: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalItems, paidTotal, paidMonth, refunded, unfulfilledCount] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true }, _count: true }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({ where: { status: "REFUNDED" }, _sum: { amount: true }, _count: true }),
    prisma.payment.count({ where: { status: "PAID", fulfilledAt: null } }),
  ]);

  const meta = buildPagination({
    requestedPage: getRequestedPage(sp),
    pageSize: getPageSize(sp),
    totalItems,
  });

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: meta.skip,
    take: meta.pageSize,
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
  });

  const rows: PaymentRow[] = payments.map((p) => ({
    id: p.id,
    kind: p.kind,
    status: p.status,
    amount: p.amount.toFixed(2),
    userName: p.user.name,
    userEmail: p.user.email,
    courseTitle: p.course.title,
    chargeId: p.culqiChargeId,
    failureMessage: p.failureMessage,
    createdAt: p.createdAt,
    paidAt: p.paidAt,
    refundedAt: p.refundedAt,
    fulfilled: Boolean(p.fulfilledAt),
    stale: p.status === "PENDING" && now.getTime() - p.createdAt.getTime() > STALE_PENDING_MS,
  }));

  const stats = [
    {
      label: "Cobrado este mes",
      value: formatCurrency(paidMonth._sum.amount?.toNumber() ?? 0),
      hint: `${paidMonth._count} ${paidMonth._count === 1 ? "pago" : "pagos"}`,
    },
    {
      label: "Cobrado total",
      value: formatCurrency(paidTotal._sum.amount?.toNumber() ?? 0),
      hint: `${paidTotal._count} ${paidTotal._count === 1 ? "pago" : "pagos"}`,
    },
    {
      label: "Reembolsado",
      value: formatCurrency(refunded._sum.amount?.toNumber() ?? 0),
      hint: `${refunded._count} ${refunded._count === 1 ? "reembolso" : "reembolsos"}`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case font-medium tracking-normal">
              Pagos
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
          <CreditCard className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pagos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cobros de cursos y certificados procesados con Culqi. Los montos se
            reconcilian con el ID de cargo en CulqiPanel.
          </p>
        </div>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {s.label}
            </dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums text-foreground">{s.value}</dd>
            <dd className="text-xs text-muted-foreground">{s.hint}</dd>
          </div>
        ))}
      </dl>

      <PaymentsTable
        payments={rows}
        meta={meta}
        unfulfilledCount={unfulfilledCount}
        hasFilters={Boolean(q) || status !== "all" || kind !== "all"}
      />
    </div>
  );
}
