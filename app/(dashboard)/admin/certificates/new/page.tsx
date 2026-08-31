import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ManualCertificateForm } from "@/components/admin/ManualCertificateForm";
import { createManualCertificate } from "@/app/actions/certificates";

export const metadata = { title: "Nuevo certificado manual | Admin" };

export default async function NewManualCertificatePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-500">
      <div>
        <Link
          href="/admin/certificates"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Certificados
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
          Emisión manual
        </p>
        <h1 className="mt-1.5 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Crear certificado manual
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Emite un certificado sin vincularlo a un curso ni a una inscripción.
          Útil para capacitaciones presenciales o programas dictados fuera de la
          plataforma.
        </p>
      </div>

      <ManualCertificateForm action={createManualCertificate} />
    </div>
  );
}
