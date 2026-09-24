import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "../_components/LegalPageLayout";
import { ComplaintForm } from "@/components/public/ComplaintForm";
import { LEGAL_COMPANY, LEGAL_LAST_UPDATED } from "@/lib/legal/company";
import {
  COMPLAINT_RESPONSE_BUSINESS_DAYS,
  COMPLAINT_TYPE_HINTS,
} from "@/lib/validations/complaint";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

export const metadata: Metadata = {
  title: { absolute: "Libro de Reclamaciones | RIVISIG Consultores" },
  description:
    "Libro de Reclamaciones virtual de RIVISIG Consultores S.A.C., conforme al Código de Protección y Defensa del Consumidor y a la normativa de INDECOPI.",
  alternates: { canonical: `${SITE_URL}/libro-de-reclamaciones` },
  robots: { index: true, follow: true },
};

export default function LibroDeReclamacionesPage() {
  return (
    <LegalPageLayout
      eyebrow="Atención al consumidor"
      title="Libro de Reclamaciones"
      description="Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571), contamos con un Libro de Reclamaciones virtual a tu disposición."
      lastUpdatedIso={LEGAL_LAST_UPDATED.reclamaciones}
      documentTitle="Libro de Reclamaciones"
      after={<ComplaintForm />}
    >
      <section id="proveedor">
        <h2>Datos del proveedor</h2>
        <ul>
          <li>
            <strong>Razón social:</strong> {LEGAL_COMPANY.razonSocial}
          </li>
          <li>
            <strong>RUC:</strong> {LEGAL_COMPANY.ruc}
          </li>
          {LEGAL_COMPANY.direccion && (
            <li>
              <strong>Domicilio:</strong> {LEGAL_COMPANY.direccion}
            </li>
          )}
          <li>
            <strong>Correo:</strong>{" "}
            <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a>
          </li>
          <li>
            <strong>Teléfono:</strong>{" "}
            <a href={`tel:${LEGAL_COMPANY.telefonoTel}`}>
              {LEGAL_COMPANY.telefono}
            </a>
          </li>
        </ul>
      </section>

      <section id="antes-de-empezar">
        <h2>Antes de empezar</h2>
        <ul>
          <li>
            <strong>Reclamo:</strong> {COMPLAINT_TYPE_HINTS.RECLAMO}
          </li>
          <li>
            <strong>Queja:</strong> {COMPLAINT_TYPE_HINTS.QUEJA}
          </li>
        </ul>
        <p>
          Al enviar la hoja recibirás un código de registro y una copia en tu
          correo electrónico. Daremos respuesta en un plazo no mayor a{" "}
          <strong>{COMPLAINT_RESPONSE_BUSINESS_DAYS} días hábiles</strong>{" "}
          contados desde su registro.
        </p>
        <p>
          La formulación del reclamo no impide acudir a otras vías de solución
          de controversias ni es requisito previo para interponer una denuncia
          ante el INDECOPI.
        </p>
        <p>
          Si lo que buscas es la devolución de un pago, puedes revisar antes
          nuestra{" "}
          <Link href="/politica-de-devoluciones">
            Política de Reembolsos y Devoluciones
          </Link>
          . Los datos que registres se tratan conforme a nuestra{" "}
          <Link href="/politica-de-privacidad">Política de Privacidad</Link>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
