/* eslint-disable jsx-a11y/alt-text */
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

Font.register({
  family: 'Playfair Display',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf',
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: 'Montserrat',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu170w-.ttf',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w-.ttf',
      fontWeight: 700,
    },
  ],
});

const RED = '#c0392b';
const YELLOW = '#f5c518';
const DARK = '#1a1a2e';
const GRAY = '#4f545e';
const LIGHT_GRAY = '#7b8088';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fafafa',
    padding: 0,
    fontFamily: 'Montserrat',
    position: 'relative',
  },

  // =========================
  // MAIN FRAMES
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
    top: 30,
    left: 30,
    right: 30,
    bottom: 30,
    borderWidth: 0.8,
    borderColor: '#ececec',
  },

  // =========================
  // CORNERS
  // =========================

  cornerTL: {
    position: 'absolute',
    top: 18,
    left: 18,
    width: 85,
    height: 85,
    borderTopWidth: 10,
    borderLeftWidth: 10,
    borderColor: RED,
  },

  cornerTLAccent: {
    position: 'absolute',
    top: 36,
    left: 36,
    width: 34,
    height: 4,
    backgroundColor: YELLOW,
  },

  cornerBR: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    width: 85,
    height: 85,
    borderBottomWidth: 10,
    borderRightWidth: 10,
    borderColor: RED,
  },

  cornerBRAccent: {
    position: 'absolute',
    bottom: 36,
    right: 36,
    width: 34,
    height: 4,
    backgroundColor: YELLOW,
  },

  // =========================
  // WATERMARK
  // =========================

  watermark: {
    position: 'absolute',
     top: 105,
    left: 215,
    width: 380,
    height: 380,
    opacity: 0.08,
    objectFit: 'contain',
  },

  // =========================
  // HEADER
  // =========================

  header: {
    position: 'absolute',
    top: 45,
    left: 55,
    right: 55,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    width: 120,
    height: 38,
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
    fontSize: 8,
    color: DARK,
    fontWeight: 600,
    marginTop: 3,
  },

  // =========================
  // BODY
  // =========================

  body: {
    position: 'absolute',
    top: 100,
    left: 55,
    right: 55,
    bottom: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },

  companyName: {
    fontSize: 8,
    color: LIGHT_GRAY,
    fontWeight: 600,
    letterSpacing: 3,
    marginBottom: 12,
  },

  titleSepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },

  titleSepLine: {
    flex: 1,
    height: 1,
    backgroundColor: RED,
    opacity: 0.5,
  },

  titleText: {
    fontSize: 9,
    fontWeight: 700,
    color: RED,
    letterSpacing: 3,
  },

  awardedTo: {
    fontSize: 8,
    color: GRAY,
    marginBottom: 8,
    letterSpacing: 1.2,
  },

  holderCompany: {
    fontSize: 9,
    color: GRAY,
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  studentName: {
    fontSize: 34,
    fontFamily: 'Playfair Display',
    fontWeight: 700,
    color: DARK,
    marginBottom: 8,
    textAlign: 'center',
  },

  nameLine: {
    width: 320,
    height: 1.2,
    backgroundColor: RED,
    opacity: 0.35,
    marginBottom: 14,
  },

  holderDni: {
    fontSize: 8.5,
    color: GRAY,
    fontWeight: 600,
    letterSpacing: 1,
    marginBottom: 18,
  },

  courseLabel: {
    fontSize: 8,
    color: GRAY,
    marginBottom: 8,
    letterSpacing: 1.5,
  },

  courseTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: RED,
    textAlign: 'center',
    maxWidth: 480,
    marginBottom: 8,
  },

  courseDescription: {
    fontSize: 9.5,
    color: GRAY,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 1.5,
    marginBottom: 24,
  },

  // =========================
  // DIVIDER
  // =========================

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 26,
  },

  dividerLine: {
    width: 45,
    height: 1,
    backgroundColor: '#d1d5db',
  },

  dividerDiamond: {
    width: 7,
    height: 7,
    backgroundColor: YELLOW,
    transform: 'rotate(45deg)',
  },

  // =========================
  // SIGNATORIES
  // =========================

  signatoriesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 45,
  },

  signatoryItem: {
    alignItems: 'center',
    width: 130,
  },

  signatoryScript: {
    fontSize: 15,
    fontFamily: 'Playfair Display',
    color: DARK,
    marginBottom: 4,
  },

  signatoryLine: {
    width: 115,
    height: 1,
    backgroundColor: '#d6d6d6',
    marginBottom: 5,
  },

  signatoryName: {
    fontSize: 7,
    fontWeight: 700,
    color: DARK,
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  signatoryTitle: {
    fontSize: 6.5,
    color: RED,
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // =========================
  // BOTTOM BAR
  // =========================

  bottomBar: {
    position: 'absolute',
    bottom: 42,
    left: 55,
    right: 55,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  infoLabel: {
    fontSize: 6,
    color: LIGHT_GRAY,
    fontWeight: 700,
    letterSpacing: 1.2,
    marginBottom: 2,
    marginTop: 6,
  },

  infoValue: {
    fontSize: 8.5,
    color: DARK,
    fontWeight: 600,
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

  // =========================
  // SEAL
  // =========================

  selloBlock: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selloImage: {
    width: 88,
    height: 88,
    objectFit: 'contain',
    opacity: 0.92,
  },

  // =========================
  // QR
  // =========================

  qrBlock: {
    alignItems: 'center',
  },

  qrImage: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },

  qrLabel: {
    fontSize: 6,
    color: GRAY,
    fontWeight: 700,
    textAlign: 'center',
    letterSpacing: 0.6,
  },

  verifyUrl: {
    fontSize: 5,
    color: RED,
    textAlign: 'center',
    maxWidth: 110,
    marginTop: 2,
  },

  verifiedBadge: {
    fontSize: 5.5,
    color: LIGHT_GRAY,
    textAlign: 'center',
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
  const resolvedIntroText = introText && introText.trim() !== ''
    ? introText
    : 'POR HABER COMPLETADO EXITOSAMENTE EL CURSO';

  return (
    <Document
      title={`Certificado — ${courseTitle}`}
      author="RIVISIG Consultores"
      subject={`Certificado de aprobación: ${courseTitle}`}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Frames */}
        <View style={styles.borderFrame} />
        <View style={styles.innerFrame} />

        {/* Corners */}
        <View style={styles.cornerTL} />
        <View style={styles.cornerTLAccent} />

        <View style={styles.cornerBR} />
        <View style={styles.cornerBRAccent} />

        {/* Watermark */}
        <Image style={styles.watermark} src={iconBase64} />

        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.logo} src={logoBase64} />

          <View style={styles.certIdBlock}>
            <Text style={styles.certIdLabel}>CERTIFICATE ID</Text>
            <Text style={styles.certIdValue}>{verificationCode}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.companyName}>RIVISIG CONSULTORES</Text>

          <View style={styles.titleSepRow}>
            <View style={styles.titleSepLine} />
            <Text style={styles.titleText}>CERTIFICADO DE FINALIZACIÓN</Text>
            <View style={styles.titleSepLine} />
          </View>

          <Text style={styles.awardedTo}>SE OTORGA EL PRESENTE A</Text>

          {studentCompany ? (
            <Text style={styles.holderCompany}>{studentCompany}</Text>
          ) : null}

          <Text style={styles.studentName}>{studentName}</Text>

          <View style={styles.nameLine} />

          {studentDni ? (
            <Text style={styles.holderDni}>DNI: {studentDni}</Text>
          ) : null}

          <Text style={styles.courseLabel}>
            {resolvedIntroText}
          </Text>

          <Text style={styles.courseTitle}>{courseTitle}</Text>

          <Text style={styles.courseDescription}>{resolvedDescription}</Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDiamond} />
            <View style={styles.dividerLine} />
          </View>

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
        </View>

        {/* Seal */}
        <View style={styles.selloBlock}>
          <Image style={styles.selloImage} src={selloBase64} />
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.infoLabel}>FECHA DE EMISIÓN</Text>

            <Text style={styles.infoValue}>{formatDate(issueDate)}</Text>

            <Text style={styles.infoLabel}>VIGENCIA</Text>

            {expiresAt ? (
              <Text style={styles.expiryValue}>
                Hasta {formatDate(expiresAt)}
              </Text>
            ) : (
              <Text style={styles.noExpiryValue}>Sin vencimiento</Text>
            )}
          </View>

          <View style={styles.qrBlock}>
            <Image style={styles.qrImage} src={qrCodeBase64} />

            <Text style={styles.qrLabel}>VERIFICAR AUTENTICIDAD</Text>

            <Text style={styles.verifyUrl}>{verificationUrl}</Text>

            <Text style={styles.verifiedBadge}>✓ VERIFICADO DIGITALMENTE</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
