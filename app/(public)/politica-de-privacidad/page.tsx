import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "../_components/LegalPageLayout";
import { LEGAL_COMPANY, LEGAL_LAST_UPDATED } from "@/lib/legal/company";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Política de Privacidad | RIVISIG Consultores",
  description:
    "Cómo protegemos y tratamos tus datos personales conforme a la Ley N° 29733 del Perú. Información sobre datos recopilados, finalidades, derechos ARCO y cookies.",
  alternates: { canonical: `${SITE_URL}/politica-de-privacidad` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Política de Privacidad — RIVISIG Consultores",
    description:
      "Tratamiento de datos personales en la plataforma RIVISIG Consultores, alineado a la Ley N° 29733 del Perú.",
    url: `${SITE_URL}/politica-de-privacidad`,
    type: "article",
  },
};

export default function PoliticaDePrivacidadPage() {
  return (
    <LegalPageLayout
      eyebrow="Documento Legal"
      title="Política de Privacidad"
      description="Información sobre cómo RIVISIG Consultores recopila, utiliza, comparte y protege tus datos personales, conforme a la Ley N° 29733 — Ley de Protección de Datos Personales del Perú."
      lastUpdatedIso={LEGAL_LAST_UPDATED.privacidad}
      documentTitle="Política de Privacidad"
    >
      <p>
        En {LEGAL_COMPANY.razonSocial} valoramos tu privacidad. La presente
        Política de Privacidad describe los datos personales que recopilamos a
        través de nuestra plataforma{" "}
        <a href={LEGAL_COMPANY.sitio} rel="noopener noreferrer">
          {LEGAL_COMPANY.sitio.replace(/^https?:\/\//, "")}
        </a>{" "}
        (la <strong>&ldquo;Plataforma&rdquo;</strong>), las finalidades del
        tratamiento, los terceros encargados, los plazos de conservación y los
        derechos que la ley te reconoce como titular de los datos.
      </p>

      <section id="cap-1">
        <h2>1. Responsable del tratamiento</h2>
        <ul>
          <li>
            <strong>Razón social:</strong> {LEGAL_COMPANY.razonSocial}
          </li>
          <li>
            <strong>RUC:</strong> {LEGAL_COMPANY.ruc}
          </li>
          <li>
            <strong>Domicilio fiscal:</strong> {LEGAL_COMPANY.domicilioFiscal},{" "}
            {LEGAL_COMPANY.ciudad} &mdash; {LEGAL_COMPANY.pais}
          </li>
          <li>
            <strong>Canal de contacto para protección de datos:</strong>{" "}
            <a href={`mailto:${LEGAL_COMPANY.emailDatos}`}>
              {LEGAL_COMPANY.emailDatos}
            </a>
          </li>
        </ul>
      </section>

      <section id="cap-2">
        <h2>2. Alcance</h2>
        <p>
          Esta Política se aplica a todos los visitantes, Usuarios registrados
          y compradores de Cursos en la Plataforma, así como a cualquier otra
          persona cuyos datos sean tratados por RIVISIG en el marco de la
          prestación de sus servicios de capacitación.
        </p>
      </section>

      <section id="cap-3">
        <h2>3. Datos personales que recopilamos</h2>
        <p>
          Recopilamos únicamente los datos necesarios para prestar el servicio
          de capacitación y emitir certificaciones. En particular:
        </p>
        <ul>
          <li>
            <strong>Datos de identificación:</strong> nombre completo, correo
            electrónico, DNI (opcional).
          </li>
          <li>
            <strong>Datos profesionales:</strong> empresa donde laboras
            (opcional).
          </li>
          <li>
            <strong>Datos de autenticación:</strong> contraseña almacenada
            siempre cifrada mediante bcrypt; <em>nunca</em> conservamos la
            contraseña en texto plano.
          </li>
          <li>
            <strong>Datos de pago:</strong> procesados directamente por nuestra
            pasarela Culqi. RIVISIG <strong>no almacena</strong> números de
            tarjeta ni códigos de seguridad (CVV). Únicamente recibimos
            metadatos de la transacción (correo del pagador, monto, descripción
            del producto e identificador de operación).
          </li>
          <li>
            <strong>Datos académicos derivados:</strong> progreso del Curso,
            intentos y resultados de evaluación, certificados emitidos.
          </li>
          <li>
            <strong>Datos técnicos:</strong> dirección IP, agente de usuario
            (navegador), fecha y hora de inicio de sesión, registrados con fines
            de seguridad y prevención de fraude.
          </li>
        </ul>
      </section>

      <section id="cap-4">
        <h2>4. Finalidades del tratamiento</h2>
        <p>Los datos personales se tratan para las siguientes finalidades:</p>
        <ul>
          <li>Crear, administrar y dar mantenimiento a tu cuenta.</li>
          <li>Procesar la inscripción y el pago de los Cursos.</li>
          <li>
            Emitir, registrar y permitir la verificación pública de los
            certificados.
          </li>
          <li>
            Enviar comunicaciones operativas (verificación de correo,
            recuperación de contraseña, avisos sobre el Curso, cambios en estos
            documentos).
          </li>
          <li>
            Cumplir obligaciones legales en materia tributaria, contable y de
            protección al consumidor.
          </li>
          <li>
            Garantizar la seguridad de la Plataforma y prevenir usos
            fraudulentos.
          </li>
          <li>
            Mejorar el servicio mediante análisis interno y anonimizado de uso.
          </li>
        </ul>
      </section>

      <section id="cap-5">
        <h2>5. Base legal del tratamiento</h2>
        <ul>
          <li>
            <strong>Consentimiento expreso</strong> otorgado por el Usuario al
            registrarse y aceptar los Términos y esta Política.
          </li>
          <li>
            <strong>Ejecución del contrato</strong> de prestación del servicio
            de capacitación.
          </li>
          <li>
            <strong>Cumplimiento de obligaciones legales</strong>,
            principalmente de naturaleza tributaria y de protección al
            consumidor.
          </li>
          <li>
            <strong>Interés legítimo</strong> de RIVISIG para mantener la
            seguridad e integridad de la Plataforma.
          </li>
        </ul>
      </section>

      <section id="cap-6">
        <h2>6. Encargados y terceros que reciben datos</h2>
        <p>
          Para operar la Plataforma utilizamos proveedores tecnológicos que
          actúan como encargados del tratamiento. Cada uno recibe únicamente la
          información mínima necesaria para cumplir su función:
        </p>
        <ul>
          <li>
            <strong>Culqi (Perú)</strong> &mdash; pasarela de pagos. Recibe el
            correo del pagador, el monto, la descripción del producto y los
            identificadores de transacción. No recibe nombre, DNI ni
            información académica.
          </li>
          <li>
            <strong>Resend (Estados Unidos)</strong> &mdash; envío transaccional
            de correos electrónicos. Recibe el nombre y el correo del Usuario
            para enviar mensajes de verificación, recuperación de contraseña y
            notificaciones operativas.
          </li>
          <li>
            <strong>Cloudinary (Estados Unidos / Israel)</strong> &mdash;
            almacenamiento y entrega de archivos multimedia. Hospeda imágenes
            y documentos cargados por administradores e instructores.
          </li>
          <li>
            <strong>Vimeo (Estados Unidos)</strong> &mdash; alojamiento y
            reproducción de los videos de los Cursos. Recibe métricas
            agregadas de reproducción.
          </li>
          <li>
            <strong>Neon (Estados Unidos / Unión Europea)</strong> &mdash;
            proveedor de la base de datos PostgreSQL administrada donde se
            almacena, cifrada en reposo, la información operativa de la
            Plataforma.
          </li>
        </ul>
        <p>
          Con cada uno de estos proveedores existe un compromiso contractual de
          confidencialidad y de cumplimiento de estándares de seguridad acordes
          con la normativa aplicable.
        </p>
      </section>

      <section id="cap-7">
        <h2>7. Transferencias internacionales</h2>
        <p>
          Algunos de los encargados antes mencionados (Resend, Cloudinary,
          Vimeo y Neon) se encuentran fuera del territorio peruano. Estas
          transferencias internacionales se realizan bajo salvaguardas
          contractuales y técnicas, incluyendo cifrado de la información en
          tránsito (TLS/HTTPS) y cifrado en reposo a nivel de base de datos. El
          Usuario, al aceptar esta Política, otorga su consentimiento expreso
          para dichas transferencias, conforme al artículo 15 de la Ley
          N.&nbsp;29733.
        </p>
      </section>

      <section id="cap-8">
        <h2>8. Plazo de conservación</h2>
        <ul>
          <li>
            <strong>Mientras la cuenta esté activa:</strong> conservamos los
            datos del Usuario por el tiempo que mantenga su cuenta abierta.
          </li>
          <li>
            <strong>Tras el cierre de la cuenta:</strong> los datos asociados
            a operaciones de compra (comprobantes y pagos) se conservan por un
            plazo de hasta diez (10) años, en cumplimiento de obligaciones
            tributarias y contables.
          </li>
          <li>
            <strong>Certificados emitidos:</strong> se conservan por un plazo
            mínimo de cinco (5) años para permitir su verificación pública.
          </li>
          <li>
            <strong>Logs de seguridad:</strong> se conservan por un plazo de
            hasta doce (12) meses.
          </li>
        </ul>
      </section>

      <section id="cap-9">
        <h2>9. Derechos del titular de los datos</h2>
        <p>
          Conforme a la Ley N.&nbsp;29733, como titular de tus datos tienes los
          siguientes derechos, conocidos como derechos <strong>ARCO</strong>:
        </p>
        <ul>
          <li>
            <strong>Acceso:</strong> conocer qué datos personales tenemos sobre
            ti.
          </li>
          <li>
            <strong>Rectificación:</strong> solicitar la corrección de datos
            inexactos o desactualizados.
          </li>
          <li>
            <strong>Cancelación:</strong> solicitar la supresión de tus datos
            cuando ya no sean necesarios o cuando retires tu consentimiento.
          </li>
          <li>
            <strong>Oposición:</strong> oponerte al tratamiento de tus datos
            para finalidades específicas.
          </li>
          <li>
            <strong>Información:</strong> ser informado sobre las condiciones
            en que se realiza el tratamiento.
          </li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, envíanos una solicitud
          escrita al correo{" "}
          <a href={`mailto:${LEGAL_COMPANY.emailDatos}`}>
            {LEGAL_COMPANY.emailDatos}
          </a>{" "}
          adjuntando copia de tu documento de identidad. Daremos respuesta en
          un plazo máximo de <strong>veinte (20) días hábiles</strong> contados
          desde la recepción de la solicitud completa.
        </p>
        <p>
          Si consideras que tu solicitud no fue atendida adecuadamente, podrás
          presentar un reclamo ante la <strong>Autoridad Nacional de
          Protección de Datos Personales</strong> del Ministerio de Justicia y
          Derechos Humanos del Perú.
        </p>
      </section>

      <section id="cap-10">
        <h2>10. Cookies y tecnologías similares</h2>
        <p>
          Utilizamos exclusivamente cookies <strong>estrictamente
          necesarias</strong> para el funcionamiento de la Plataforma. No
          utilizamos cookies de publicidad, perfilado ni análisis de terceros.
        </p>
        <p>
          <strong>Cookies usadas:</strong>
        </p>
        <ul>
          <li>
            <code>session</code> &mdash; cookie de sesión cifrada (JWT) con
            atributos <code>httpOnly</code>, <code>Secure</code> y{" "}
            <code>SameSite=Lax</code>. Tiene una vigencia máxima de 7 días y
            permite mantener al Usuario autenticado. Base legal: ejecución del
            contrato.
          </li>
        </ul>
        <p>
          Dado que únicamente empleamos cookies estrictamente necesarias, no se
          requiere un banner de consentimiento previo conforme a la normativa
          aplicable. El Usuario puede deshabilitar las cookies desde la
          configuración de su navegador, sin embargo, ello impedirá el inicio
          de sesión en la Plataforma.
        </p>
      </section>

      <section id="cap-11">
        <h2>11. Seguridad de la información</h2>
        <p>
          RIVISIG aplica medidas técnicas y organizativas razonables para
          proteger los datos personales contra accesos no autorizados,
          alteración, divulgación o destrucción:
        </p>
        <ul>
          <li>Contraseñas almacenadas con cifrado bcrypt (12 rondas de sal).</li>
          <li>
            Tokens de sesión firmados, con atributos <code>httpOnly</code>,{" "}
            <code>Secure</code> y <code>SameSite</code>.
          </li>
          <li>Comunicación cifrada extremo a extremo mediante TLS (HTTPS).</li>
          <li>Cifrado en reposo a nivel de la base de datos.</li>
          <li>
            Principio de mínimo privilegio en el acceso administrativo a los
            sistemas.
          </li>
        </ul>
        <p>
          No obstante, ningún sistema informático es absolutamente invulnerable,
          por lo que el Usuario reconoce que el tratamiento de datos en
          entornos digitales conlleva riesgos inherentes que RIVISIG mitiga
          razonablemente.
        </p>
      </section>

      <section id="cap-12">
        <h2>12. Menores de edad</h2>
        <p>
          La Plataforma no está dirigida a menores de 14 años. Los Usuarios
          entre 14 y 17 años solo podrán registrarse con autorización expresa
          de quien ostente la patria potestad o representación legal. RIVISIG
          se reserva el derecho de suspender cuentas que infrinjan este
          requisito.
        </p>
      </section>

      <section id="cap-13">
        <h2>13. Modificaciones de la Política</h2>
        <p>
          Podemos actualizar esta Política para reflejar cambios legales,
          tecnológicos o de servicio. La fecha de la versión vigente se indica
          en la cabecera del documento. Cuando el cambio sea sustancial,
          notificaremos por correo electrónico a los Usuarios registrados con
          una antelación razonable a su entrada en vigor.
        </p>
      </section>

      <section id="cap-14">
        <h2>14. Contacto</h2>
        <p>
          Para cualquier consulta o solicitud relacionada con esta Política, o
          para ejercer tus derechos como titular de datos, puedes escribirnos
          a{" "}
          <a href={`mailto:${LEGAL_COMPANY.emailDatos}`}>
            {LEGAL_COMPANY.emailDatos}
          </a>
          .
        </p>
        <p>
          Esta Política forma parte integral de los{" "}
          <Link href="/terminos-y-condiciones">Términos y Condiciones</Link>{" "}
          de la Plataforma.
        </p>
      </section>
    </LegalPageLayout>
  );
}
