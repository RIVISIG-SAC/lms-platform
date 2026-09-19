import type { Metadata } from "next";
import Link from "next/link";
import { LegalPageLayout } from "../_components/LegalPageLayout";
import { LEGAL_COMPANY, LEGAL_LAST_UPDATED } from "@/lib/legal/company";
import {
  COOKIES_PROPIAS,
  COOKIES_TERCEROS,
  COOKIE_CATEGORY_LABELS,
  GUIAS_NAVEGADOR,
  POLITICAS_TERCEROS,
  SERVICIOS_SIN_COOKIES,
  type CookieEntry,
} from "@/lib/legal/cookies";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rivisig.com";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: { absolute: "Política de Cookies | RIVISIG Consultores" },
  description:
    "Qué cookies utiliza la plataforma RIVISIG Consultores, con qué finalidad, cuánto duran y cómo gestionarlas desde tu navegador. Conforme a la Ley N° 29733 del Perú.",
  alternates: { canonical: `${SITE_URL}/politica-de-cookies` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Política de Cookies — RIVISIG Consultores",
    description:
      "Detalle de las cookies que utiliza la plataforma RIVISIG Consultores y cómo controlarlas.",
    url: `${SITE_URL}/politica-de-cookies`,
    type: "article",
  },
};

/**
 * Tabla de cookies.
 *
 * En móvil una tabla de cinco columnas se vuelve ilegible, así que se permite
 * el desplazamiento horizontal y se marca la región como desplazable con
 * teclado (`tabIndex`), que si no queda inalcanzable para quien no usa ratón.
 */
function CookieTable({
  caption,
  entries,
}: {
  caption: string;
  entries: CookieEntry[];
}) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="not-prose my-6 overflow-x-auto rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3">Cookie</th>
            <th scope="col" className="px-4 py-3">Proveedor</th>
            <th scope="col" className="px-4 py-3">Categoría</th>
            <th scope="col" className="px-4 py-3">Finalidad</th>
            <th scope="col" className="px-4 py-3">Duración</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {entries.map((cookie) => (
            <tr key={cookie.nombre} className="align-top">
              <th scope="row" className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                {cookie.nombre}
                <span className="mt-1 block font-sans text-[11px] font-normal text-muted-foreground">
                  {cookie.ambito}
                </span>
              </th>
              <td className="px-4 py-3 text-muted-foreground">{cookie.proveedor}</td>
              <td className="px-4 py-3">
                <span className="inline-block rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                  {COOKIE_CATEGORY_LABELS[cookie.categoria]}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{cookie.finalidad}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {cookie.duracion}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PoliticaDeCookiesPage() {
  const pageUrl = `${SITE_URL}/politica-de-cookies`;
  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": pageUrl,
    url: pageUrl,
    name: "Política de Cookies",
    description:
      "Qué cookies utiliza RIVISIG Consultores, con qué finalidad y cómo gestionarlas.",
    inLanguage: "es-PE",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    dateModified: LEGAL_LAST_UPDATED.cookies,
    lastReviewed: LEGAL_LAST_UPDATED.cookies,
  };

  return (
    <LegalPageLayout
      eyebrow="Documento Legal"
      title="Política de Cookies"
      description="Qué cookies utiliza la Plataforma, con qué finalidad, cuánto duran y cómo puedes controlarlas desde tu navegador."
      lastUpdatedIso={LEGAL_LAST_UPDATED.cookies}
      documentTitle="Política de Cookies"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />

      <p>
        Esta Política de Cookies explica el uso de cookies y tecnologías
        similares en la plataforma de {LEGAL_COMPANY.razonSocial} (la{" "}
        <strong>&ldquo;Plataforma&rdquo;</strong>), disponible en{" "}
        <a href={LEGAL_COMPANY.sitio} rel="noopener noreferrer">
          {LEGAL_COMPANY.sitio.replace(/^https?:\/\//, "")}
        </a>
        . Complementa nuestra{" "}
        <Link href="/politica-de-privacidad">Política de Privacidad</Link> y se
        rige por la Ley N° 29733 &mdash; Ley de Protección de Datos Personales
        del Perú y su Reglamento (D.S. N° 003-2013-JUS).
      </p>

      <section id="cap-1">
        <h2>1. Qué es una cookie</h2>
        <p>
          Una cookie es un archivo de texto muy pequeño que un sitio web guarda
          en tu navegador cuando lo visitas. En visitas posteriores, el
          navegador se la devuelve al sitio, lo que permite recordar
          información entre una página y otra &mdash;por ejemplo, que ya
          iniciaste sesión&mdash;.
        </p>
        <p>
          Bajo el mismo apartado se incluyen tecnologías equivalentes como el{" "}
          <em>almacenamiento local</em> del navegador. La Plataforma{" "}
          <strong>no utiliza almacenamiento local ni de sesión</strong> para
          guardar información sobre ti.
        </p>
      </section>

      <section id="cap-2">
        <h2>2. Resumen</h2>
        <p>
          La Plataforma instala <strong>una sola cookie propia</strong>, que es
          estrictamente necesaria para mantener tu sesión iniciada. No
          utilizamos cookies de publicidad, de perfilado ni de seguimiento entre
          sitios, y no vendemos ni cedemos información sobre tu navegación.
        </p>
        <p>
          Además de esa cookie, ciertos servicios externos que integramos
          pueden instalar cookies propias cuando usas una funcionalidad
          concreta: el reproductor de video dentro de un curso y la pasarela de
          pago. Se detallan en el apartado 4.
        </p>
      </section>

      <section id="cap-3">
        <h2>3. Cookies propias</h2>
        <p>
          Son las que instalamos nosotros desde nuestro propio dominio. Todas
          son <strong>estrictamente necesarias</strong>: sin ellas la Plataforma
          no puede prestar el servicio que solicitas.
        </p>

        <CookieTable
          caption="Cookies propias que instala la Plataforma"
          entries={COOKIES_PROPIAS}
        />

        <p>
          La cookie <code>session</code> se emite con los atributos de seguridad{" "}
          <code>HttpOnly</code> (no es accesible desde JavaScript, lo que la
          protege frente a robo por scripts maliciosos),{" "}
          <code>Secure</code> (solo viaja por conexiones cifradas) y{" "}
          <code>SameSite=Lax</code> (no se envía en peticiones iniciadas desde
          otros sitios). Se elimina al cerrar sesión o, como máximo, a los 7
          días.
        </p>
        <p>
          <strong>No contiene tu contraseña.</strong> Guarda un identificador
          firmado criptográficamente con tu identificador de usuario, rol,
          nombre y correo, de modo que no puede alterarse sin invalidarse.
        </p>
      </section>

      <section id="cap-4">
        <h2>4. Cookies de terceros</h2>
        <p>
          No las instalamos ni las controlamos nosotros: las coloca el
          proveedor del servicio embebido, y solo aparecen cuando usas la
          funcionalidad correspondiente. Su tratamiento se rige por la política
          de privacidad de cada proveedor.
        </p>

        <CookieTable
          caption="Cookies que pueden instalar servicios de terceros"
          entries={COOKIES_TERCEROS}
        />

        <p>
          Ambos servicios son <strong>necesarios para prestar el servicio
          contratado</strong>: sin el reproductor no es posible ver las clases y
          sin la pasarela no es posible completar un pago. Por eso no se
          solicita un consentimiento separado para ellos. Si prefieres no
          aceptar sus cookies, puedes bloquear las cookies de terceros en tu
          navegador, con la consecuencia de que el video o el pago dejarán de
          funcionar.
        </p>
        <p>Políticas de privacidad de los proveedores:</p>
        <ul>
          {POLITICAS_TERCEROS.map((tercero) => (
            <li key={tercero.nombre}>
              <a href={tercero.url} target="_blank" rel="noopener noreferrer">
                {tercero.nombre}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section id="cap-5">
        <h2>5. Servicios que no instalan cookies</h2>
        <p>
          Los listamos por transparencia: intervienen en el funcionamiento de la
          Plataforma pero no guardan nada en tu navegador.
        </p>
        <ul>
          {SERVICIOS_SIN_COOKIES.map((servicio) => (
            <li key={servicio.nombre}>
              <strong>{servicio.nombre}</strong> ({servicio.proveedor}):{" "}
              {servicio.detalle}
            </li>
          ))}
        </ul>
      </section>

      <section id="cap-6">
        <h2>6. Por qué no mostramos un banner de consentimiento</h2>
        <p>
          La normativa exige consentimiento previo para las cookies que{" "}
          <em>no</em> son imprescindibles para prestar el servicio: las de
          publicidad, perfilado o analítica que identifican a la persona. La
          Plataforma no utiliza ninguna de esas.
        </p>
        <p>
          La única cookie propia es la de sesión, sin la cual no podrías entrar
          a tu cuenta, y las de terceros solo aparecen dentro de funciones que
          tú mismo solicitas. Un banner en estas condiciones no te daría ninguna
          opción real, así que hemos optado por explicarlo con detalle en esta
          página en lugar de mostrarte un aviso que no puedes rechazar.
        </p>
        <p>
          Si en el futuro incorporamos herramientas de analítica identificativa
          o de marketing, actualizaremos esta política e implementaremos el
          mecanismo de consentimiento que corresponda antes de activarlas.
        </p>
      </section>

      <section id="cap-7">
        <h2>7. Cómo gestionar o eliminar las cookies</h2>
        <p>
          Puedes revisar, bloquear o borrar las cookies desde la configuración
          de tu navegador. Ten en cuenta que{" "}
          <strong>
            si bloqueas la cookie de sesión no podrás iniciar sesión ni acceder
            a tus cursos
          </strong>
          , ya que el navegador olvidará quién eres en cada página.
        </p>
        <ul>
          {GUIAS_NAVEGADOR.map((navegador) => (
            <li key={navegador.nombre}>
              <a href={navegador.url} target="_blank" rel="noopener noreferrer">
                Gestionar cookies en {navegador.nombre}
              </a>
            </li>
          ))}
        </ul>
        <p>
          También puedes cerrar sesión desde tu perfil en cualquier momento: al
          hacerlo eliminamos la cookie de sesión de tu navegador.
        </p>
      </section>

      <section id="cap-8">
        <h2>8. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta Política de Cookies cuando cambien los
          servicios que integramos o la normativa aplicable. La fecha de{" "}
          <em>última actualización</em> figura al inicio de la página. Te
          recomendamos revisarla periódicamente.
        </p>
      </section>

      <section id="cap-9">
        <h2>9. Contacto</h2>
        <p>
          Si tienes dudas sobre esta política o quieres ejercer tus derechos en
          materia de protección de datos, escríbenos a{" "}
          <a href={`mailto:${LEGAL_COMPANY.emailDatos}`}>
            {LEGAL_COMPANY.emailDatos}
          </a>{" "}
          o consulta el procedimiento detallado en nuestra{" "}
          <Link href="/politica-de-privacidad">Política de Privacidad</Link>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
