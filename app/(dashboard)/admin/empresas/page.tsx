import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { POST_STATUSES } from "@/lib/validations/empresas";
import {
  buildPagination,
  getEnumParam,
  getPageSize,
  getRequestedPage,
  getSearchParam,
  type SearchParamsRecord,
} from "@/lib/pagination";
import { CompaniesTable } from "@/components/admin/empresas/CompaniesTable";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Building2, Plus } from "lucide-react";

export const metadata = { title: "Empresas | Admin" };

export default async function AdminEmpresasPage(props: {
  searchParams: Promise<unknown>;
}) {
  const sp = (await props.searchParams) as SearchParamsRecord;
  const q = getSearchParam(sp, "q");
  const status = getEnumParam(sp, "status", POST_STATUSES);

  const where: Prisma.CompanyWhereInput = {
    ...(status !== "all" ? { status } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { sector: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalItems, totalCompanies, publishedCount, draftCount] =
    await Promise.all([
      prisma.company.count({ where }),
      prisma.company.count(),
      prisma.company.count({ where: { status: "PUBLISHED" } }),
      prisma.company.count({ where: { status: "DRAFT" } }),
    ]);

  const meta = buildPagination({
    requestedPage: getRequestedPage(sp),
    pageSize: getPageSize(sp),
    totalItems,
  });

  const companies = await prisma.company.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    skip: meta.skip,
    take: meta.pageSize,
    select: {
      id: true,
      name: true,
      slug: true,
      sector: true,
      logoUrl: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">Empresas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4 min-w-0">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
            <Building2 className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Empresas (casos de éxito)</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCompanies} {totalCompanies === 1 ? "empresa" : "empresas"} · {publishedCount} publicada
              {publishedCount === 1 ? "" : "s"} · {draftCount} borrador{draftCount === 1 ? "" : "es"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button render={<Link href="/admin/empresas/new" />} nativeButton={false} className="shadow-sm">
            <Plus className="size-4" /> Nueva empresa
          </Button>
        </div>
      </div>

      <CompaniesTable
        companies={companies}
        meta={meta}
        hasFilters={Boolean(q) || status !== "all"}
      />
    </div>
  );
}
