import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { CertificatesTable } from "@/components/admin/CertificatesTable";
import {
  buildPagination,
  getEnumParam,
  getPageSize,
  getRequestedPage,
  getSearchParam,
  type SearchParamsRecord,
} from "@/lib/pagination";

export const metadata = { title: "Certificados | Admin" };

const STATUSES = ["ACTIVE", "EXPIRED", "REVOKED", "PENDING_PAYMENT"] as const;
const ORIGINS = ["exam", "manual"] as const;

/**
 * "Vencido" no siempre está guardado en la BD: un certificado ACTIVE con
 * `expiresAt` en el pasado se muestra como vencido. El filtro replica esa
 * misma regla en SQL para que lo que se lista coincida con lo que se ve.
 */
function statusWhere(
  status: (typeof STATUSES)[number] | "all",
): Prisma.CertificateWhereInput {
  const now = new Date();

  switch (status) {
    case "ACTIVE":
      return {
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      };
    case "EXPIRED":
      return {
        OR: [
          { status: "EXPIRED" },
          { status: "ACTIVE", expiresAt: { lt: now } },
        ],
      };
    case "all":
      return {};
    default:
      return { status };
  }
}

export default async function AdminCertificatesPage(props: {
  searchParams: Promise<unknown>;
}) {
  const sp = (await props.searchParams) as SearchParamsRecord;
  const q = getSearchParam(sp, "q");
  const status = getEnumParam(sp, "status", STATUSES);
  const origin = getEnumParam(sp, "origin", ORIGINS);

  const where: Prisma.CertificateWhereInput = {
    AND: [
      statusWhere(status),
      origin === "manual"
        ? { enrollmentId: null }
        : origin === "exam"
          ? { enrollmentId: { not: null } }
          : {},
      q
        ? {
            OR: [
              { verificationCode: { contains: q, mode: "insensitive" } },
              { holderName: { contains: q, mode: "insensitive" } },
              { certificateTitle: { contains: q, mode: "insensitive" } },
              { course: { title: { contains: q, mode: "insensitive" } } },
              {
                enrollment: {
                  is: { user: { name: { contains: q, mode: "insensitive" } } },
                },
              },
              {
                enrollment: {
                  is: { course: { title: { contains: q, mode: "insensitive" } } },
                },
              },
            ],
          }
        : {},
    ],
  };

  const [totalItems, totalCertificates, manualCount] = await Promise.all([
    prisma.certificate.count({ where }),
    prisma.certificate.count(),
    prisma.certificate.count({ where: { enrollmentId: null } }),
  ]);

  const meta = buildPagination({
    requestedPage: getRequestedPage(sp),
    pageSize: getPageSize(sp),
    totalItems,
  });

  const certificates = await prisma.certificate.findMany({
    where,
    orderBy: { issueDate: "desc" },
    skip: meta.skip,
    take: meta.pageSize,
    include: {
      enrollment: {
        include: {
          user: { select: { name: true, company: true } },
          course: { select: { title: true } },
        },
      },
      course: { select: { title: true } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Certificados
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4 min-w-0">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
            <Award className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Certificados emitidos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCertificates}{" "}
              {totalCertificates === 1 ? "certificado" : "certificados"} ·{" "}
              {manualCount} manual{manualCount === 1 ? "" : "es"}
            </p>
          </div>
        </div>
        <Button
          render={<Link href="/admin/certificates/new" />}
          nativeButton={false}
          className="shrink-0 shadow-sm"
        >
          <Plus className="size-4" /> Crear certificado manual
        </Button>
      </div>

      <CertificatesTable
        certificates={certificates}
        meta={meta}
        hasFilters={Boolean(q) || status !== "all" || origin !== "all"}
      />
    </div>
  );
}
