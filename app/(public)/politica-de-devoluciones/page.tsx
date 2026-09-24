import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "../_components/LegalPageLayout";
import {
  ATTENTION_HOURS,
  LEGAL_COMPANY,
  LEGAL_LAST_UPDATED,
  REFUND_TERMS,
} from "@/lib/legal/company";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: "Política de Reembolsos y Devoluciones | RIVISIG Consultores" },
  description:
    "Plazos, condiciones y procedimiento para solicitar el reembolso de un curso, programa o certificación adquirido en RIVISIG Consultores.",
  alternates: { canonical: `${SITE_URL}/politica-de-devoluciones` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Política de Reembolsos y Devoluciones — RIVISIG Consultores",
    description:
      "Cómo y cuándo solicitar un reembolso en RIVISIG Consultores, y en qué plazo se atiende.",
    url: `${SITE_URL}/politica-de-devoluciones`,
    type: "article",
  },
};

export default function PoliticaDeDevolucionesPage() {
  const pageUrl = `${SITE_URL}/politica-de-devoluciones`;
  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: "Política de Reembolsos y Devoluciones",
    description:
      "Plazos, condiciones y procedimiento para solicitar un reembolso en RIVISIG Consultores.",
    inLanguage: "es-PE",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    dateModified: LEGAL_LAST_UPDATED.devoluciones,
    lastReviewed: LEGAL_LAST_UPDATED.devoluciones,
  };

  const { diasParaSolicitar, horasHabilesRespuesta, diasHabilesGestion } =
    REFUND_TERMS;

  return (
    <LegalPageLayout
      eyebrow="Documento Legal"
      title="Política de Reembolsos y Devoluciones"
      description="Condiciones, plazos y procedimiento para solicitar el reembolso de un curso, programa de capacitación o servicio de certificación."
      lastUpdatedIso={LEGAL_LAST_UPDATED.devoluciones}
      documentTitle="Política de Reembolsos y Devoluciones"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />

      <p>
        La presente Política de Reembolsos, Devoluciones y Atención de
        Solicitudes es aplicable a los servicios ofrecidos por{" "}
        {LEGAL_COMPANY.razonSocial}, identificada con RUC {LEGAL_COMPANY.ruc}{" "}
        (en adelante, <strong>RIVISIG</strong>), y forma parte integral de los{" "}
        <Link href="/terminos-y-condiciones">Términos y Condiciones</Link> de
        la Plataforma.
      </p>

      <section id="cap-1">
        <h2>1. Objetivo</h2>
        <p>
          Establecer las condiciones, plazos y procedimiento aplicables a las
          solicitudes de reembolso y devolución relacionadas con los cursos,
          programas de capacitación, servicios de certificación y demás
          productos o servicios ofrecidos por RIVISIG.
        </p>
        <p>
          La presente política busca brindar información clara al participante
          y establecer un proceso ordenado y trazable para la atención de sus
          solicitudes.
        </p>
      </section>

      <section id="cap-2">
        <h2>2. Alcance</h2>
        <p>
          La presente política aplica a las personas que adquieran cursos,
          programas de capacitación, servicios de certificación u otros
          productos o servicios ofrecidos a través de los canales oficiales de
          RIVISIG, incluyendo su plataforma virtual, sitio web y otros medios
          autorizados.
        </p>
        <p>
          Las condiciones específicas de cada curso o servicio podrán
          establecer requisitos adicionales, los cuales serán informados al
          participante antes de efectuar la adquisición.
        </p>
      </section>

      <section id="cap-3">
        <h2>3. Plazo para solicitar un reembolso</h2>
        <p>
          El participante podrá solicitar el reembolso de un curso o servicio
          adquirido dentro de un plazo máximo de{" "}
          <strong>{diasParaSolicitar} días calendario</strong> contados desde
          la fecha en que se efectuó el pago.
        </p>
        <p>
          El plazo se determina a partir de la fecha registrada de la operación
          de pago y no se reinicia ni amplía por la presentación de consultas,
          incidencias, reclamos o solicitudes de soporte.
        </p>
        <p>
          Las solicitudes presentadas después de dicho plazo serán evaluadas
          únicamente cuando exista una circunstancia excepcional, un
          incumplimiento atribuible a RIVISIG o cuando corresponda conforme a
          la legislación aplicable.
        </p>
      </section>

      <section id="cap-4">
        <h2>4. Condiciones para solicitar un reembolso</h2>
        <p>
          La presentación de una solicitud dentro del plazo de{" "}
          {diasParaSolicitar} días no implica automáticamente la aprobación del
          reembolso. Para evaluar la solicitud, RIVISIG podrá considerar, según
          corresponda:
        </p>
        <ul>
          <li>Fecha y comprobación del pago.</li>
          <li>Tipo de curso o servicio adquirido.</li>
          <li>Tiempo transcurrido desde la adquisición.</li>
          <li>Nivel de acceso y utilización del contenido.</li>
          <li>Visualización o consumo de clases grabadas.</li>
          <li>Participación en sesiones en vivo.</li>
          <li>Descarga de materiales.</li>
          <li>Uso de evaluaciones, recursos u otros beneficios asociados.</li>
          <li>Estado de emisión de la certificación.</li>
          <li>Existencia de alguna incidencia atribuible a RIVISIG.</li>
        </ul>
        <p>
          La decisión será comunicada al participante a través del canal de
          contacto registrado.
        </p>
      </section>

      <section id="cap-5">
        <h2>5. Cursos gratuitos</h2>
        <p>
          Los cursos ofrecidos gratuitamente por RIVISIG no generan derecho a
          reembolso, debido a que no existe un importe pagado por el acceso al
          curso.
        </p>
        <p>
          Cuando un curso gratuito incluya una certificación opcional con
          costo, el importe correspondiente a dicha certificación se regirá por
          las condiciones establecidas en la presente política.
        </p>
      </section>

      <section id="cap-6">
        <h2>6. Cursos con certificación de pago posterior</h2>
        <p>
          En aquellos cursos en los que el participante pueda realizar la
          capacitación sin efectuar inicialmente el pago de la certificación,
          el pago posterior tendrá como finalidad gestionar la emisión del
          certificado correspondiente, siempre que el participante cumpla con
          los requisitos establecidos para su obtención.
        </p>
        <p>
          El pago de la certificación constituye un servicio independiente del
          acceso gratuito al contenido del curso.
        </p>
        <p>
          Una vez que el certificado haya sido emitido y/o puesto a disposición
          del participante para su descarga, no procederá la devolución del
          importe correspondiente a la certificación, salvo que exista un error
          o incumplimiento atribuible a RIVISIG o corresponda conforme a la
          legislación aplicable.
        </p>
      </section>

      <section id="cap-7">
        <h2>7. Certificados emitidos o descargados</h2>
        <p>
          Una vez emitido y puesto a disposición el certificado, el
          participante podrá descargarlo utilizando los mecanismos habilitados
          por RIVISIG. La descarga del certificado constituye la utilización
          del servicio de certificación contratado.
        </p>
        <p>
          Por tanto, una vez que el certificado haya sido descargado por el
          participante, no procederá la devolución del importe correspondiente
          a la certificación, salvo que exista un incumplimiento atribuible a
          RIVISIG o resulte aplicable una disposición legal.
        </p>
        <p>
          Cuando se detecte un error en los datos del certificado que sea
          atribuible a RIVISIG, se podrá realizar la corrección o reemisión
          correspondiente, según el caso.
        </p>
      </section>

      <section id="cap-8">
        <h2>8. Contenido digital y materiales</h2>
        <p>
          Cuando un curso incluya videos, documentos, presentaciones,
          evaluaciones, manuales, formatos u otros recursos digitales, RIVISIG
          podrá considerar el nivel de utilización de dichos contenidos al
          evaluar una solicitud de reembolso.
        </p>
        <p>
          El reembolso podrá no proceder cuando se haya producido un consumo
          sustancial del contenido digital, descarga significativa de
          materiales o utilización de los beneficios asociados al curso, sin
          perjuicio de los derechos que correspondan al participante conforme a
          la legislación aplicable.
        </p>
      </section>

      <section id="cap-9">
        <h2>9. Cursos en vivo</h2>
        <p>
          En los cursos que incluyan sesiones en vivo, la solicitud de
          reembolso deberá realizarse dentro del plazo establecido en la
          presente política. RIVISIG podrá considerar la participación del
          participante en las sesiones realizadas, especialmente cuando se haya
          producido una utilización sustancial del servicio contratado.
        </p>
        <p>
          Cuando una sesión sea cancelada o no pueda ser desarrollada por
          causas atribuibles a RIVISIG, se podrá ofrecer, según corresponda:
        </p>
        <ul>
          <li>Reprogramación de la sesión.</li>
          <li>Acceso a una nueva fecha.</li>
          <li>Acceso a una grabación, cuando corresponda.</li>
          <li>Sustitución por una actividad equivalente.</li>
          <li>
            Reembolso total o parcial, según las circunstancias del caso y la
            legislación aplicable.
          </li>
        </ul>
      </section>

      <section id="cap-10">
        <h2>10. Casos atribuibles a RIVISIG</h2>
        <p>
          Cuando por causas atribuibles a RIVISIG un servicio adquirido no
          pueda ser prestado o se produzca una incidencia que impida
          sustancialmente al participante utilizar el servicio contratado,
          RIVISIG evaluará el caso y podrá ofrecer:
        </p>
        <ul>
          <li>Corrección de la incidencia.</li>
          <li>Reprogramación.</li>
          <li>Acceso a una nueva edición del curso.</li>
          <li>Sustitución por un servicio equivalente.</li>
          <li>Reembolso total o parcial, cuando corresponda.</li>
        </ul>
        <p>
          La alternativa aplicable será determinada considerando la naturaleza
          de la incidencia y las condiciones del servicio adquirido. Los cobros
          duplicados o por un servicio no adquirido se reembolsan en su
          totalidad.
        </p>
      </section>

      <section id="cap-11">
        <h2>11. Canales y horario de atención</h2>
        <p>
          Las solicitudes, consultas e incidencias relacionadas con reembolsos
          deberán ser presentadas a través de los canales oficiales de atención
          de RIVISIG:
        </p>
        <ul>
          <li>
            Correo electrónico:{" "}
            <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a>
          </li>
          <li>
            Teléfono:{" "}
            <a href={`tel:${LEGAL_COMPANY.telefonoTel}`}>
              {LEGAL_COMPANY.telefono}
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a
              href={`https://wa.me/${LEGAL_COMPANY.telefonoTel.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {LEGAL_COMPANY.telefono}
            </a>
          </li>
        </ul>
        <p>
          <strong>Horario de atención:</strong>
        </p>
        <ul>
          {ATTENTION_HOURS.map(({ dias, horario }) => (
            <li key={dias}>
              {dias}: {horario}.
            </li>
          ))}
        </ul>
        <p>
          Las solicitudes recibidas dentro del horario de atención serán
          registradas en la fecha de recepción. Las solicitudes recibidas fuera
          del horario establecido, así como aquellas recibidas durante domingos
          o feriados, serán consideradas como recibidas el siguiente día hábil.
        </p>
      </section>

      <section id="cap-12">
        <h2>12. Procedimiento para solicitar un reembolso</h2>
        <p>
          El participante deberá presentar su solicitud mediante los canales
          oficiales de RIVISIG, proporcionando la información necesaria para
          identificar la operación. La solicitud deberá incluir, como mínimo:
        </p>
        <ul>
          <li>Nombres y apellidos.</li>
          <li>Correo electrónico utilizado durante la inscripción o compra.</li>
          <li>Nombre del curso o servicio.</li>
          <li>Fecha de pago.</li>
          <li>Comprobante o referencia de la operación.</li>
          <li>Motivo de la solicitud.</li>
          <li>
            Información adicional que pueda ser requerida para evaluar el caso.
          </li>
        </ul>
        <p>
          RIVISIG podrá solicitar información adicional cuando sea necesaria
          para verificar la operación o determinar la procedencia del
          reembolso.
        </p>
        <p>
          La solicitud de reembolso es independiente del{" "}
          <Link href="/libro-de-reclamaciones">Libro de Reclamaciones</Link>,
          que el participante puede
          utilizar en cualquier momento conforme al Código de Protección y
          Defensa del Consumidor.
        </p>
      </section>

      <section id="cap-13">
        <h2>13. Tiempo de respuesta</h2>
        <p>
          RIVISIG brindará una respuesta a las solicitudes de reembolso dentro
          de un plazo máximo de{" "}
          <strong>{horasHabilesRespuesta} horas hábiles</strong>, contadas
          desde la fecha de recepción de la solicitud conforme al horario de
          atención establecido.
        </p>
        <p>
          El plazo de {horasHabilesRespuesta} horas hábiles corresponde al
          tiempo de atención y respuesta de la solicitud y no constituye el
          plazo de acreditación del dinero en la cuenta del participante.
        </p>
      </section>

      <section id="cap-14">
        <h2>14. Aprobación del reembolso</h2>
        <p>
          Cuando la solicitud sea aprobada, RIVISIG comunicará al participante:
        </p>
        <ul>
          <li>La aprobación del reembolso.</li>
          <li>El importe que será devuelto.</li>
          <li>El medio mediante el cual se realizará la devolución.</li>
          <li>
            Cualquier información adicional necesaria para efectuar la
            operación.
          </li>
        </ul>
        <p>
          Cuando corresponda una devolución parcial, se informará previamente
          el importe que será objeto de reembolso.
        </p>
      </section>

      <section id="cap-15">
        <h2>15. Medio y titularidad del reembolso</h2>
        <p>
          Cuando corresponda efectuar un reembolso, RIVISIG realizará la
          devolución al titular que efectuó el pago, utilizando, de ser
          posible, el mismo medio de pago empleado durante la adquisición. Para
          los pagos con tarjeta procesados por <strong>Culqi</strong>, la
          devolución se efectúa como extorno a la misma tarjeta con la que se
          realizó la compra.
        </p>
        <p>
          Cuando por razones operativas o por las características del medio de
          pago sea necesario efectuar una transferencia bancaria, el reembolso
          se realizará a una cuenta bancaria de titularidad del cliente o
          participante que efectuó el pago. RIVISIG podrá solicitar información
          o documentación que permita verificar la titularidad de la cuenta
          antes de efectuar la devolución.
        </p>
        <p>
          No se efectuarán transferencias a cuentas de terceros, salvo que
          exista una circunstancia justificada y RIVISIG haya autorizado
          expresamente dicha modalidad.
        </p>
      </section>

      <section id="cap-16">
        <h2>16. Plazo para efectuar el reembolso</h2>
        <p>
          Una vez aprobada la solicitud, RIVISIG gestionará el reembolso dentro
          de un plazo máximo de{" "}
          <strong>{diasHabilesGestion} días hábiles</strong>.
        </p>
        <p>
          El tiempo efectivo para que el importe sea reflejado en la cuenta del
          participante dependerá de los plazos de procesamiento del banco,
          entidad financiera, pasarela de pago u otro medio utilizado para
          efectuar la operación. Los tiempos adicionales correspondientes al
          procesamiento de terceros no forman parte del plazo de gestión
          interna de RIVISIG.
        </p>
      </section>

      <section id="cap-17">
        <h2>17. Casos excepcionales</h2>
        <p>
          RIVISIG podrá evaluar excepcionalmente solicitudes que no cumplan
          alguna de las condiciones establecidas en esta política cuando
          existan circunstancias particulares que justifiquen su revisión.
        </p>
        <p>
          La evaluación de un caso excepcional no constituye precedente ni
          implica la obligación de aprobar solicitudes similares en el futuro.
          En todos los casos se respetarán los derechos que correspondan al
          participante conforme a la legislación aplicable.
        </p>
      </section>

      <section id="cap-18">
        <h2>18. Prevención de usos indebidos</h2>
        <p>
          RIVISIG podrá verificar la información proporcionada por el
          participante antes de aprobar un reembolso.
        </p>
        <p>
          Cuando se identifiquen inconsistencias, operaciones no reconocidas,
          uso indebido de los servicios, duplicidad de solicitudes u otras
          circunstancias que requieran verificación, RIVISIG podrá suspender
          temporalmente la evaluación hasta contar con la información
          necesaria. Esto no afectará los derechos que correspondan al
          participante conforme a la legislación aplicable.
        </p>
      </section>

      <section id="cap-19">
        <h2>19. Actualización de la política</h2>
        <p>
          RIVISIG podrá actualizar la presente política cuando resulte
          necesario debido a cambios en sus servicios, procesos, plataformas,
          medios de pago o requisitos legales aplicables. La versión vigente
          será publicada en esta página, con su fecha de{" "}
          <em>última actualización</em>.
        </p>
        <p>
          Las condiciones aplicables a una operación serán las que hayan sido
          informadas y aceptadas por el participante al momento de realizar la
          adquisición, sin perjuicio de las modificaciones que resulten
          exigibles conforme a la legislación aplicable.
        </p>
      </section>

      <section id="cap-20">
        <h2>20. Aceptación</h2>
        <p>
          Al adquirir un curso o servicio ofrecido por RIVISIG, el participante
          declara haber tenido acceso a la presente Política de Reembolsos,
          Devoluciones y Atención de Solicitudes y acepta las condiciones
          aplicables a la operación.
        </p>
        <p>
          La aceptación podrá registrarse mediante los mecanismos habilitados
          en la plataforma, sitio web u otros canales oficiales de RIVISIG.
        </p>
      </section>
    </LegalPageLayout>
  );
}
