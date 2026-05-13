import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      certificateDescription: true,
      certificateValidityDays: true,
    },
    orderBy: { title: "asc" },
  });

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
            Emite un certificado para una persona externa (sin cuenta en la plataforma). El PDF mostrará la
            empresa, el nombre y el DNI ingresados.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <ManualCertificateForm
            courses={courses}
            action={createManualCertificate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
