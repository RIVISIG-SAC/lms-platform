import Link from "next/link";
import { ManualCertificateForm } from "@/components/admin/ManualCertificateForm";
import { createManualCertificate } from "@/app/actions/certificates";
import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata = { title: "Nuevo certificado manual | Admin" };

export default async function NewManualCertificatePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin/certificates" />}>
              Certificados
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Nuevo manual
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
          <Award className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Crear certificado manual
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Emite un certificado sin depender de cursos registrados. El PDF mostrará el título, la
            empresa, el nombre, el DNI y la vigencia que definas.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <ManualCertificateForm
            action={createManualCertificate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
