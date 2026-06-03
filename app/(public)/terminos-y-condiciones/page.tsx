import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "../_components/LegalPageLayout";
import { LEGAL_COMPANY, LEGAL_LAST_UPDATED } from "@/lib/legal/company";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: "Términos y Condiciones | RIVISIG Consultores" },
  description:
    "Términos y condiciones de uso de la plataforma de capacitación de RIVISIG Consultores. Acceso a cursos, evaluaciones, certificación y pagos.",
  alternates: { canonical: `${SITE_URL}/terminos-y-condiciones` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Términos y Condiciones — RIVISIG Consultores",
    description:
      "Condiciones generales de uso, registro, evaluaciones, certificación y pagos en la plataforma RIVISIG Consultores.",
    url: `${SITE_URL}/terminos-y-condiciones`,
    type: "article",
  },
};

export default function TerminosYCondicionesPage() {
  const pageUrl = `${SITE_URL}/terminos-y-condiciones`;
  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: "Términos y Condiciones",
    description:
      "Términos y condiciones de uso de la plataforma de capacitación de RIVISIG Consultores.",
    inLanguage: "es-PE",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    dateModified: LEGAL_LAST_UPDATED.terminos,
    lastReviewed: LEGAL_LAST_UPDATED.terminos,
  };

  return (
    <LegalPageLayout
      eyebrow="Documento Legal"
      title="Términos y Condiciones"
      description="Condiciones generales que regulan el acceso y uso de la plataforma de capacitación de RIVISIG Consultores. Lee con atención antes de registrarte o adquirir un curso."
      lastUpdatedIso={LEGAL_LAST_UPDATED.terminos}
      documentTitle="Términos y Condiciones"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />

      <p>
        Los presentes Términos y Condiciones (en adelante, los{" "}
        <strong>&ldquo;Términos&rdquo;</strong>) regulan el acceso y uso de la
        plataforma web operada por {LEGAL_COMPANY.razonSocial}, identificada
        con RUC {LEGAL_COMPANY.ruc} (en adelante, <strong>RIVISIG</strong>
        ), disponible a través del sitio{" "}
        <a href={LEGAL_COMPANY.sitio} rel="noopener noreferrer">
          {LEGAL_COMPANY.sitio.replace(/^https?:\/\//, "")}
        </a>{" "}
        (la <strong>&ldquo;Plataforma&rdquo;</strong>). El uso de la Plataforma
        implica la aceptación plena y sin reservas de estos Términos.
      </p>

      <section id="cap-1">
        <h2>1. Identificación del titular</h2>
        <ul>
          <li>
            <strong>Razón social:</strong> {LEGAL_COMPANY.razonSocial}
          </li>
          <li>
            <strong>RUC:</strong> {LEGAL_COMPANY.ruc}
          </li>
          <li>
            <strong>Correo electrónico:</strong>{" "}
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

      <section id="cap-2">
        <h2>2. Definiciones</h2>
        <ul>
          <li>
            <strong>Plataforma:</strong> sitio web, aplicaciones y servicios
            digitales puestos a disposición por RIVISIG.
          </li>
          <li>
            <strong>Usuario:</strong> toda persona natural que accede o utiliza
            la Plataforma, sea como visitante, registrado o alumno inscrito.
          </li>
          <li>
            <strong>Curso:</strong> programa formativo de modalidad
            e&#8209;learning ofrecido por RIVISIG, compuesto por capítulos,
            material audiovisual, recursos descargables y evaluaciones.
          </li>
          <li>
            <strong>Evaluación:</strong> prueba en línea que permite al Usuario
            acreditar los aprendizajes del Curso.
          </li>
          <li>
            <strong>Certificado:</strong> documento digital emitido por RIVISIG
            que acredita la aprobación de un Curso, identificado por un código
            único verificable.
          </li>
          <li>
            <strong>Cuenta:</strong> conjunto de credenciales y datos asociados
            al Usuario que le permiten acceder a la Plataforma.
          </li>
        </ul>
      </section>

      <section id="cap-3">
        <h2>3. Objeto del servicio</h2>
        <p>
          RIVISIG ofrece a través de la Plataforma servicios de capacitación
          profesional en Sistemas de Gestión (ISO 9001, ISO 14001, ISO 45001,
          ISO 27001, entre otros) y materias afines, bajo modalidad 100% online
          y autoguiada. Los Cursos incluyen, según el caso, material
          audiovisual, lecturas, evaluaciones y la emisión de un Certificado de
          aprovechamiento.
        </p>
      </section>

      <section id="cap-4">
        <h2>4. Aceptación de los Términos</h2>
        <p>
          El registro en la Plataforma, la adquisición de un Curso o el simple
          uso del sitio implican la aceptación íntegra de estos Términos. Si el
          Usuario no está de acuerdo con alguna disposición, deberá abstenerse
          de utilizar la Plataforma. El Usuario declara ser mayor de edad
          (18&nbsp;años o más) o, en su defecto, contar con autorización
          expresa del titular de la patria potestad o de la empresa en la que
          labora.
        </p>
      </section>

      <section id="cap-5">
        <h2>5. Registro y cuenta de Usuario</h2>
        <h3>5.1. Datos requeridos</h3>
        <p>
          El registro requiere nombre completo, correo electrónico y contraseña.
          Adicionalmente, el Usuario podrá completar datos opcionales como DNI
          y empresa donde labora.
        </p>
        <h3>5.2. Verificación de correo</h3>
        <p>
          Previo al primer inicio de sesión, el Usuario deberá validar su
          correo electrónico mediante el enlace enviado por RIVISIG, vigente
          por 24 horas. Mientras no se complete la verificación, no podrá
          accederse a la Plataforma.
        </p>
        <h3>5.3. Política de contraseña</h3>
        <p>
          La contraseña deberá tener un mínimo de 8 caracteres, incluir al
          menos una mayúscula y un número, y será renovada cada 90 días por
          razones de seguridad. Vencida la contraseña, la Cuenta quedará
          inhabilitada hasta su renovación.
        </p>
        <h3>5.4. Confidencialidad de credenciales</h3>
        <p>
          El Usuario es responsable de la custodia de sus credenciales. RIVISIG
          presume que toda actividad realizada con la Cuenta corresponde al
          Usuario titular. El Usuario deberá notificar de inmediato cualquier
          uso no autorizado al correo{" "}
          <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a>.
        </p>
        <h3>5.5. Cuenta personal e intransferible</h3>
        <p>
          La Cuenta es personal e intransferible. Está prohibido compartir
          credenciales o permitir el acceso a terceros, bajo sanción de
          suspensión definitiva sin derecho a reembolso.
        </p>
      </section>

      <section id="cap-6">
        <h2>6. Cursos: condiciones de acceso y uso</h2>
        <h3>6.1. Plazo de acceso</h3>
        <p>
          Una vez confirmada la inscripción a un Curso, el Usuario tendrá
          acceso al contenido por <strong>180 días calendario</strong>{" "}
          contados desde la fecha de activación. Vencido dicho plazo, el
          acceso al material será cerrado de forma automática.
        </p>
        <h3>6.2. Modalidad</h3>
        <p>
          Los Cursos se imparten exclusivamente en modalidad e&#8209;learning
          asincrónica, sin clases en tiempo real, salvo que el Curso indique
          expresamente sesiones en vivo.
        </p>
        <h3>6.3. Compromisos de RIVISIG</h3>
        <p>
          RIVISIG se compromete a mantener el contenido del Curso disponible
          durante el plazo de acceso, a garantizar la disponibilidad
          razonable de la Plataforma y a actualizar el material cuando exista
          cambio normativo relevante.
        </p>
        <h3>6.4. Compromisos del Usuario</h3>
        <p>
          El Usuario se compromete a utilizar el contenido únicamente para su
          formación personal, a no compartir las credenciales, a no descargar
          ni reproducir el material por medios no autorizados y a respetar la
          propiedad intelectual del contenido.
        </p>
      </section>

      <section id="cap-7">
        <h2>7. Evaluaciones y certificación</h2>
        <h3>7.1. Intentos de evaluación</h3>
        <p>
          Cada evaluación del Curso podrá rendirse hasta un máximo de{" "}
          <strong>dos (2) intentos</strong>. Agotados ambos intentos sin
          alcanzar la nota aprobatoria, el resultado quedará registrado como{" "}
          <em>desaprobado</em> y el Usuario no podrá rendir nuevamente la
          evaluación en ese mismo Curso.
        </p>
        <h3>7.2. Reintento mediante nueva inscripción</h3>
        <p>
          Si el Usuario desea volver a intentar la certificación tras agotar
          los intentos, deberá adquirir nuevamente el Curso, sin derecho a
          reembolso del importe ya pagado por la inscripción anterior.
        </p>
        <h3>7.3. Emisión del Certificado</h3>
        <p>
          El Certificado se emite únicamente tras la aprobación de la
          evaluación final del Curso. Será expedido en formato PDF, contendrá
          un código único de verificación y podrá ser comprobado en cualquier
          momento desde la URL{" "}
          <Link href="/verificar">/verificar</Link>.
        </p>
        <h3>7.4. Tarifa adicional</h3>
        <p>
          Determinados Cursos podrán contemplar una tarifa adicional para la
          emisión del Certificado. Dicho costo, si aplica, se informará
          expresamente al Usuario antes de la compra y formará parte del
          precio total del servicio.
        </p>
      </section>

      <section id="cap-8">
        <h2>8. Precios, pagos y comprobantes</h2>
        <h3>8.1. Moneda y precios</h3>
        <p>
          Todos los precios mostrados en la Plataforma se expresan en{" "}
          <strong>Soles peruanos (PEN)</strong> e incluyen los impuestos que
          resulten aplicables.
        </p>
        <h3>8.2. Pasarela de pago</h3>
        <p>
          Los pagos se procesan a través de la pasarela{" "}
          <strong>Culqi</strong>, regulada por la normativa peruana. RIVISIG no
          accede, no procesa ni almacena en sus servidores datos completos de
          tarjetas de crédito o débito. Dichos datos son recolectados y
          tokenizados directamente por Culqi en el navegador del Usuario.
        </p>
        <h3>8.3. Métodos aceptados</h3>
        <p>
          Se aceptan tarjetas de crédito y débito de las marcas habilitadas
          por Culqi (Visa, Mastercard, American Express y Diners Club, según
          disponibilidad).
        </p>
        <h3>8.4. Comprobantes de pago</h3>
        <p>
          A solicitud del Usuario, RIVISIG emitirá el comprobante de pago
          correspondiente (boleta o factura electrónica) conforme a la
          normativa SUNAT. Para la emisión de factura el Usuario deberá
          proporcionar la razón social y RUC del adquirente al correo{" "}
          <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a>{" "}
          dentro de las 48 horas posteriores al pago.
        </p>
        <h3>8.5. Política de no reembolso</h3>
        <p>
          Tratándose de contenido digital de acceso inmediato, una vez activado
          el Curso el Usuario reconoce haber iniciado el consumo del servicio,
          razón por la cual <strong>no procede el derecho de retracto</strong>{" "}
          ni el reembolso del importe pagado, salvo en los siguientes
          supuestos:
        </p>
        <ul>
          <li>
            Falla técnica imputable a RIVISIG que impida el acceso al Curso por
            más de cinco (5) días hábiles consecutivos y no haya sido resuelta
            tras solicitud formal del Usuario.
          </li>
          <li>
            Error material en el cobro (doble cargo o cobro por un Curso no
            adquirido).
          </li>
        </ul>
      </section>

      <section id="cap-9">
        <h2>9. Propiedad intelectual</h2>
        <p>
          Todos los contenidos disponibles en la Plataforma &mdash; incluyendo
          videos, presentaciones, documentos descargables, evaluaciones, marcas,
          logotipos, código fuente y diseños &mdash; son propiedad exclusiva de{" "}
          {LEGAL_COMPANY.razonSocial} o se utilizan bajo licencia legítima de
          sus titulares.
        </p>
        <p>
          La inscripción a un Curso otorga al Usuario una licencia personal,
          revocable, no exclusiva e intransferible para acceder al material
          únicamente con fines de formación individual. Queda expresamente
          prohibido reproducir, descargar mediante medios no autorizados,
          distribuir, retransmitir, comunicar públicamente, modificar o
          comercializar el contenido, total o parcialmente.
        </p>
        <p>
          La marca <em>RIVISIG</em> y su logotipo son propiedad de{" "}
          {LEGAL_COMPANY.razonSocial} y se encuentran protegidos por la
          legislación peruana e internacional sobre propiedad intelectual.
        </p>
      </section>

      <section id="cap-10">
        <h2>10. Conducta del Usuario y prohibiciones</h2>
        <p>El Usuario se obliga a no incurrir en las siguientes conductas:</p>
        <ul>
          <li>
            Suplantar la identidad de terceros o proporcionar información
            falsa.
          </li>
          <li>
            Compartir credenciales o permitir el uso simultáneo de la Cuenta
            por terceras personas.
          </li>
          <li>
            Utilizar herramientas automatizadas, bots, scrapers o cualquier
            mecanismo para extraer contenido o acceder a áreas restringidas.
          </li>
          <li>
            Vulnerar, intentar vulnerar o comprometer la seguridad de la
            Plataforma o de sus Usuarios.
          </li>
          <li>
            Publicar, transmitir o cargar contenido ilícito, difamatorio,
            obsceno o que infrinja derechos de terceros.
          </li>
          <li>
            Realizar ingeniería inversa o intentar acceder al código fuente
            de la Plataforma.
          </li>
        </ul>
      </section>

      <section id="cap-11">
        <h2>11. Suspensión y cancelación de Cuenta</h2>
        <p>
          RIVISIG podrá suspender o cancelar la Cuenta del Usuario, sin
          notificación previa, cuando se verifique el incumplimiento de los
          presentes Términos. La suspensión conlleva la pérdida del acceso al
          material del Curso sin derecho a reembolso.
        </p>
        <p>
          El Usuario podrá solicitar la baja voluntaria de su Cuenta en
          cualquier momento, escribiendo al correo{" "}
          <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a>.
          La baja implica la pérdida del acceso a Cursos activos, sin
          devolución del importe pagado.
        </p>
      </section>

      <section id="cap-12">
        <h2>12. Disponibilidad del servicio y mantenimiento</h2>
        <p>
          RIVISIG realizará esfuerzos razonables para mantener la Plataforma
          disponible las 24 horas del día, los 7 días de la semana. No
          obstante, no garantiza un nivel de servicio (SLA) específico y podrá
          realizar interrupciones por mantenimiento, actualización o causas
          de fuerza mayor, procurando notificar con antelación cuando ello
          sea posible.
        </p>
      </section>

      <section id="cap-13">
        <h2>13. Limitación de responsabilidad</h2>
        <p>
          En la máxima medida permitida por la ley, {LEGAL_COMPANY.razonSocial}{" "}
          no responderá por daños indirectos, lucro cesante, daño emergente o
          pérdida de oportunidad derivados del uso o de la imposibilidad de
          uso de la Plataforma. La responsabilidad total de RIVISIG frente al
          Usuario, por cualquier concepto, se limita al importe efectivamente
          pagado por el Usuario por el Curso que dio origen a la controversia.
        </p>
      </section>

      <section id="cap-14">
        <h2>14. Modificaciones de los Términos</h2>
        <p>
          RIVISIG podrá modificar los presentes Términos en cualquier momento.
          Las modificaciones entrarán en vigor desde su publicación en la
          Plataforma y se reflejarán en el indicador de &ldquo;Última
          actualización&rdquo;. Cambios sustanciales serán notificados por
          correo electrónico a los Usuarios registrados. El uso continuado de
          la Plataforma tras la publicación de los cambios implicará la
          aceptación de los Términos actualizados.
        </p>
      </section>

      <section id="cap-15">
        <h2>15. Protección de datos personales</h2>
        <p>
          El tratamiento de los datos personales del Usuario se rige por la{" "}
          <Link href="/politica-de-privacidad">Política de Privacidad</Link>,
          documento que forma parte integral de estos Términos y que se ajusta
          a la Ley N.&nbsp;29733, Ley de Protección de Datos Personales del
          Perú, y su Reglamento.
        </p>
      </section>

      <section id="cap-16">
        <h2>16. Reclamos y atención al consumidor</h2>
        <p>
          Cualquier reclamo, consulta o queja podrá dirigirse al correo{" "}
          <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a> o
          al teléfono{" "}
          <a href={`tel:${LEGAL_COMPANY.telefonoTel}`}>
            {LEGAL_COMPANY.telefono}
          </a>
          . RIVISIG dará respuesta en un plazo máximo de 15 días hábiles
          contados desde su recepción, conforme al Código de Protección y
          Defensa del Consumidor (Ley N.&nbsp;29571).
        </p>
      </section>

      <section id="cap-17">
        <h2>17. Ley aplicable y jurisdicción</h2>
        <p>
          Los presentes Términos se rigen por las leyes de la República del
          Perú. Toda controversia derivada de su interpretación o ejecución
          será sometida, en primera instancia, a un proceso de trato directo
          de buena fe entre las partes; de no resolverse, será competencia
          exclusiva de los jueces y tribunales del distrito judicial de Lima
          Cercado.
        </p>
      </section>

      <section id="cap-18">
        <h2>18. Contacto</h2>
        <p>
          Para cualquier consulta sobre estos Términos, puedes escribirnos a{" "}
          <a href={`mailto:${LEGAL_COMPANY.email}`}>{LEGAL_COMPANY.email}</a> o
          llamarnos al{" "}
          <a href={`tel:${LEGAL_COMPANY.telefonoTel}`}>
            {LEGAL_COMPANY.telefono}
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
