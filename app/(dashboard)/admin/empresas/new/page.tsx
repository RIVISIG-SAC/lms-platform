import Link from "next/link";
import { CompanyForm } from "@/components/admin/empresas/CompanyForm";
import { createCompany } from "@/app/actions/empresas";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata = { title: "Nueva empresa | Admin" };

export default function NewCompanyPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin/empresas" />}>Empresas</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">Nueva empresa</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nueva empresa</h1>
        <p className="text-sm text-muted-foreground mt-1">Crea un nuevo caso de éxito para la sección Empresas.</p>
      </div>

      <CompanyForm action={createCompany} />
    </div>
  );
}
