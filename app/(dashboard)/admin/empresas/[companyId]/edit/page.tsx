import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CompanyForm } from "@/components/admin/empresas/CompanyForm";
import { updateCompany } from "@/app/actions/empresas";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata = { title: "Editar empresa | Admin" };

type Params = Promise<{ companyId: string }>;

export default async function EditCompanyPage({ params }: { params: Params }) {
  const { companyId } = await params;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      facts: { orderBy: { order: "asc" } },
      services: { orderBy: { order: "asc" } },
      achievements: { orderBy: { order: "asc" } },
      awards: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!company) notFound();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin/empresas" />}>Empresas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium line-clamp-1 max-w-[40ch]">
              {company.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar empresa</h1>
        <p className="text-sm text-muted-foreground mt-1 font-mono">/empresas/{company.slug}</p>
      </div>

      <CompanyForm action={updateCompany} company={company} />
    </div>
  );
}
