/* eslint-disable jsx-a11y/alt-text */
import path from 'path';
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { formatDate } from './utils';

Font.registerHyphenationCallback((word) => [word]);

// Las fuentes se empaquetan en el repo en vez de resolverse contra
// fonts.gstatic.com en tiempo de render: en serverless una latencia o un fallo
// de red dejaba el PDF sin tipografias (o reventaba la request).
const fontPath = (file: string) =>
  path.join(process.cwd(), 'public', 'fonts', file);

Font.register({
  family: 'Playfair Display',
  fonts: [
    { src: fontPath('PlayfairDisplay-Regular.ttf'), fontWeight: 400 },
    { src: fontPath('PlayfairDisplay-Bold.ttf'), fontWeight: 700 },
  ],
});

Font.register({
  family: 'Montserrat',
  fonts: [
    { src: fontPath('Montserrat-Regular.ttf'), fontWeight: 400 },
    { src: fontPath('Montserrat-SemiBold.ttf'), fontWeight: 600 },
    { src: fontPath('Montserrat-Bold.ttf'), fontWeight: 700 },
  ],
});

Font.register({
  family: 'Great Vibes',
  fonts: [{ src: fontPath('GreatVibes-Regular.ttf'), fontWeight: 400 }],
});

const RED = '#c0392b';
const YELLOW = '#f5c518';
const DARK = '#1a1a2e';
const GRAY = '#4f545e';
const LIGHT_GRAY = '#7b8088';
const HAIRLINE = '#d8dade';

// A4 apaisado = 842 x 595 pt.
const PAGE_W = 842;
const PAGE_H = 595;
const WATERMARK_SIZE = 300;
const HEADER_H = 42;
const FOOTER_H = 168;

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fafafa',
    padding: 0,
    fontFamily: 'Montserrat',
    position: 'relative',
  },

  // El contenido vive dentro del "stage" para que los marcos absolutos sigan
  // midiendose contra el borde de la pagina y no contra el padding.
  stage: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 44,
    paddingBottom: 36,
    paddingHorizontal: 58,
  },

  // =========================
  // MARCOS
  // =========================

  borderFrame: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    bottom: 18,
    borderWidth: 1.5,
    borderColor: '#d7d7d7',
  },

  innerFrame: {
    position: 'absolute',
    top: 26,
    left: 26,
    right: 26,
    bottom: 26,
    borderWidth: 0.8,
    borderColor: '#e9e9e9',
  },

  // =========================
  // ESQUINAS (las cuatro, para que la composicion cierre)
  // =========================

  cornerTL: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 58,
    height: 58,
    borderTopWidth: 7,
    borderLeftWidth: 7,
    borderColor: RED,
  },

  cornerTR: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 58,
    height: 58,
    borderTopWidth: 7,
    borderRightWidth: 7,
    borderColor: RED,
  },

  cornerBL: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    width: 58,
    height: 58,
    borderBottomWidth: 7,
    borderLeftWidth: 7,
    borderColor: RED,
  },

  cornerBR: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    width: 58,
    height: 58,
    borderBottomWidth: 7,
    borderRightWidth: 7,
    borderColor: RED,
  },

  // Verticales y pegados al bracket: en horizontal el acento inferior invadía
  // la línea del pie con la URL de verificación.
  accentTL: {
    position: 'absolute',
    top: 34,
    left: 34,
    width: 3.5,
    height: 30,
    backgroundColor: YELLOW,
  },

  accentBR: {
    position: 'absolute',
    bottom: 34,
    right: 34,
    width: 3.5,
    height: 30,
    backgroundColor: YELLOW,
  },

  // =========================
  // MARCA DE AGUA
  // =========================

  watermark: {
    position: 'absolute',
    top: (PAGE_H - WATERMARK_SIZE) / 2,
    left: (PAGE_W - WATERMARK_SIZE) / 2,
    width: WATERMARK_SIZE,
    height: WATERMARK_SIZE,
    opacity: 0.028,
    objectFit: 'contain',
  },

  // =========================
  // CABECERA
  // =========================

  header: {
    height: HEADER_H,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    width: 116,
    height: 36,
    objectFit: 'contain',
  },

  certIdBlock: {
    alignItems: 'flex-end',
  },

  certIdLabel: {
    fontSize: 6.5,
    color: LIGHT_GRAY,
    fontWeight: 700,
    letterSpacing: 1.8,
  },

  certIdValue: {
    fontSize: 8.5,
    color: DARK,
    fontWeight: 700,
    marginTop: 3,
    letterSpacing: 0.6,
  },

  // =========================
  // CONTENIDO (unica zona elastica del documento)
  // =========================

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  kicker: {
    fontSize: 7.5,
    color: LIGHT_GRAY,
    fontWeight: 600,
    letterSpacing: 3.5,
    marginBottom: 8,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },

  titleRule: {
    width: 52,
    height: 1,
    backgroundColor: RED,
    opacity: 0.45,
  },

  titleText: {
    fontSize: 14,
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    color: RED,
    letterSpacing: 2.5,
  },

  awardedTo: {
    fontSize: 7.5,
    color: GRAY,
    letterSpacing: 1.8,
    marginBottom: 6,
  },

  holderCompany: {
    fontSize: 9,
    color: GRAY,
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 5,
    textTransform: 'uppercase',
  },

  studentName: {
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    color: DARK,
    marginBottom: 6,
    textAlign: 'center',
    maxLines: 1,
    textOverflow: 'ellipsis',
  },

  nameLine: {
    width: 300,
    height: 1.2,
    backgroundColor: RED,
    opacity: 0.35,
    marginBottom: 9,
  },

  holderDni: {
    fontSize: 8,
    color: GRAY,
    fontWeight: 600,
    letterSpacing: 1,
    marginBottom: 12,
  },

  courseLabel: {
    fontSize: 7.5,
    color: GRAY,
    letterSpacing: 1.8,
    marginBottom: 7,
  },

  // El rojo queda reservado para acentos y microtipografia: el titulo del curso
  // en navy deja de competir con el nombre del participante.
  courseTitle: {
    fontWeight: 700,
    color: DARK,
    textAlign: 'center',
    maxWidth: 560,
    lineHeight: 1.3,
    marginBottom: 8,
    maxLines: 2,
    textOverflow: 'ellipsis',
  },

  courseDescription: {
    color: GRAY,
    textAlign: 'center',
    maxWidth: 540,
    lineHeight: 1.55,
    maxLines: 4,
    textOverflow: 'ellipsis',
  },

  // =========================
  // PIE (altura fija: el texto del cuerpo ya no puede desplazarlo)
  // =========================

  footer: {
    height: FOOTER_H,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },

  signatoriesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 52,
    marginBottom: 18,
  },

  signatoryItem: {
    alignItems: 'center',
    width: 148,
  },

  signatoryScript: {
    fontSize: 20,
    fontFamily: 'Great Vibes',
    color: DARK,
    marginBottom: 1,
  },

  signatoryLine: {
    width: 132,
    height: 0.9,
    backgroundColor: '#c9ccd1',
    marginBottom: 6,
  },

  signatoryName: {
    fontSize: 7,
    fontWeight: 700,
    color: DARK,
    textAlign: 'center',
    letterSpacing: 0.5,
    maxLines: 1,
    textOverflow: 'ellipsis',
  },

  signatoryTitle: {
    fontSize: 6.5,
    color: RED,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 1,
  },

  // =========================
  // BARRA INFERIOR: metadatos - sello - QR
  // =========================

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  bottomLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },

  bottomCenter: {
    flex: 1,
    alignItems: 'center',
  },

  bottomRight: {
    flex: 1,
    alignItems: 'flex-end',
  },

  metaLabel: {
    fontSize: 6,
    color: LIGHT_GRAY,
    fontWeight: 700,
    letterSpacing: 1.2,
    marginBottom: 2,
  },

  metaValue: {
    fontSize: 8.5,
    color: DARK,
    fontWeight: 600,
  },

  metaDivider: {
    width: 84,
    height: 0.8,
    backgroundColor: HAIRLINE,
    marginVertical: 7,
  },

  expiryValue: {
    fontSize: 8.5,
    fontWeight: 700,
    color: RED,
  },

  noExpiryValue: {
    fontSize: 8.5,
    fontWeight: 700,
    color: '#16a34a',
  },

  // El sello ocupa el hueco central de la barra, que antes estaba vacio y
  // obligaba a anclarlo sobre la firma del medio.
  selloImage: {
    width: 84,
    height: 84,
    objectFit: 'contain',
    opacity: 0.95,
  },

  qrImage: {
    width: 58,
    height: 58,
    marginBottom: 5,
  },

  qrLabel: {
    fontSize: 6,
    color: GRAY,
    fontWeight: 700,
    textAlign: 'right',
    letterSpacing: 0.8,
  },

  verifiedBadge: {
    fontSize: 5.5,
    color: LIGHT_GRAY,
    textAlign: 'right',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

type Props = {
  studentName: string;
  studentDni?: string | null;
  studentCompany?: string | null;
  courseTitle: string;
  introText?: string;
  description?: string | null;
  issueDate: Date;
  verificationCode: string;
  verificationUrl: string;
  expiresAt?: Date | null;
  logoBase64: string;
  selloBase64: string;
  qrCodeBase64: string;
  iconBase64: string;
};

const DEFAULT_DESCRIPTION =
  'Por haber completado satisfactoriamente el programa de capacitación profesional, demostrando dominio en los conceptos y prácticas del sector.';

const SIGNATORIES = [
  {
    script: 'L. Rivera',
    name: 'ING. LEWIS RIVERA VILLACREZ',
    title: 'INSTRUCTOR',
  },
  {
    script: 'R. Soria',
    name: 'ROSA SORIA LOPEZ',
    title: 'ADMINISTRADORA',
  },
  {
    script: 'D. Leyva',
    name: 'DEISY LEYVA ARANA',
    title: 'COORDINADORA',
  },
];

const NAME_STEPS = [
  [26, 34],
  [34, 30],
  [42, 26],
  [52, 21],
] as const;

const COURSE_STEPS = [
  [55, 15],
  [110, 13.5],
  [165, 12],
] as const;

/**
 * Escala el cuerpo tipografico segun el largo del texto para que el bloque
 * ocupe siempre el mismo numero de lineas. Sin esto, un nombre o un titulo
 * largo desbordaba la zona de contenido.
 */
function fitFontSize(
  text: string,
  steps: readonly (readonly [number, number])[],
  fallback: number,
) {
  for (const [maxChars, size] of steps) {
    if (text.length <= maxChars) return size;
  }
  return fallback;
}

export function CertificatePDF({
  studentName,
  studentDni,
  studentCompany,
  courseTitle,
  introText,
  description,
  issueDate,
  verificationCode,
  verificationUrl,
  expiresAt,
  logoBase64,
  selloBase64,
  qrCodeBase64,
  iconBase64,
}: Props) {
  const resolvedDescription =
    description && description.trim() !== ''
      ? description
      : DEFAULT_DESCRIPTION;
  const resolvedIntroText =
    introText && introText.trim() !== ''
      ? introText
      : 'POR HABER COMPLETADO EXITOSAMENTE EL CURSO';

  const nameSize = fitFontSize(studentName, NAME_STEPS, 17);
  const courseSize = fitFontSize(courseTitle, COURSE_STEPS, 10.5);
  const descriptionSize = resolvedDescription.length > 300 ? 8.2 : 8.8;

  // El QR ya transporta la URL: mostrarla completa en 5pt era ilegible y
  // ensuciaba el pie. Se conserva solo el host como pista de origen.
  const verificationHost = verificationUrl
    .replace(/^https?:\/\//, '')
    .split('/')[0];

  return (
    <Document
      title={`Certificado — ${courseTitle}`}
      author="RIVISIG Consultores"
      subject={`Certificado de aprobación: ${courseTitle}`}
    >
      <Page size="A4" orientation="landscape" style={styles.page} wrap={false}>
        {/* Capa decorativa */}
        <View style={styles.borderFrame} />
        <View style={styles.innerFrame} />

        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />
        <View style={styles.accentTL} />
        <View style={styles.accentBR} />

        <Image style={styles.watermark} src={iconBase64} />

        <View style={styles.stage}>
          {/* Cabecera */}
          <View style={styles.header}>
            <Image style={styles.logo} src={logoBase64} />

            <View style={styles.certIdBlock}>
              <Text style={styles.certIdLabel}>CERTIFICATE ID</Text>
              <Text style={styles.certIdValue}>{verificationCode}</Text>
            </View>
          </View>

          {/* Contenido */}
          <View style={styles.content}>
            <Text style={styles.kicker}>RIVISIG CONSULTORES</Text>

            <View style={styles.titleRow}>
              <View style={styles.titleRule} />
              <Text style={styles.titleText}>CERTIFICADO DE FINALIZACIÓN</Text>
              <View style={styles.titleRule} />
            </View>

            <Text style={styles.awardedTo}>SE OTORGA EL PRESENTE A</Text>

            {studentCompany ? (
              <Text style={styles.holderCompany}>{studentCompany}</Text>
            ) : null}

            <Text style={[styles.studentName, { fontSize: nameSize }]}>
              {studentName}
            </Text>

            <View style={styles.nameLine} />

            {studentDni ? (
              <Text style={styles.holderDni}>DNI: {studentDni}</Text>
            ) : null}

            <Text style={styles.courseLabel}>{resolvedIntroText}</Text>

            <Text style={[styles.courseTitle, { fontSize: courseSize }]}>
              {courseTitle}
            </Text>

            <Text
              style={[styles.courseDescription, { fontSize: descriptionSize }]}
            >
              {resolvedDescription}
            </Text>
          </View>

          {/* Pie */}
          <View style={styles.footer}>
            <View style={styles.signatoriesRow}>
              {SIGNATORIES.map((sig) => (
                <View key={sig.name} style={styles.signatoryItem}>
                  <Text style={styles.signatoryScript}>{sig.script}</Text>

                  <View style={styles.signatoryLine} />

                  <Text style={styles.signatoryName}>{sig.name}</Text>

                  <Text style={styles.signatoryTitle}>{sig.title}</Text>
                </View>
              ))}
            </View>

            <View style={styles.bottomBar}>
              <View style={styles.bottomLeft}>
                <Text style={styles.metaLabel}>FECHA DE EMISIÓN</Text>

                <Text style={styles.metaValue}>{formatDate(issueDate)}</Text>

                <View style={styles.metaDivider} />

                <Text style={styles.metaLabel}>VIGENCIA</Text>

                {expiresAt ? (
                  <Text style={styles.expiryValue}>
                    Hasta {formatDate(expiresAt)}
                  </Text>
                ) : (
                  <Text style={styles.noExpiryValue}>Sin vencimiento</Text>
                )}
              </View>

              <View style={styles.bottomCenter}>
                <Image style={styles.selloImage} src={selloBase64} />
              </View>

              <View style={styles.bottomRight}>
                <Image style={styles.qrImage} src={qrCodeBase64} />

                <Text style={styles.qrLabel}>VERIFICAR AUTENTICIDAD</Text>

                <Text style={styles.verifiedBadge}>
                  {verificationHost} · VERIFICADO DIGITALMENTE
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
