import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDate } from "./utils";

Font.registerHyphenationCallback((word) => [word]);

Font.register({
  family: "Playfair Display",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvUDQ.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf",
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "Montserrat",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCu170w-.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM70w-.ttf",
      fontWeight: 700,
    },
  ],
});

const RED = "#c0392b";
const BLACK = "#0f0f10";
const YELLOW = "#f5c518";
const DARK = "#1a1a2e";
const GRAY = "#4f545e";
const LIGHT_GRAY = "#54585e";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fafafa",
    padding: 0,
    fontFamily: "Montserrat",
    position: "relative",
  },

  // === Watermark — icon.png at low opacity centered behind content ===
  watermark: {
    position: "absolute",
    top: 105,
    left: 215,
    width: 380,
    height: 380,
    opacity: 0.08,
    objectFit: "contain",
  },

  // === Geometric corner accents — top-left ===
  // Stacked rotated rectangles forming an angular red/black/yellow accent
  geoTL_Black: {
    position: "absolute",
    top: -55,
    left: -55,
    width: 150,
    height: 150,
    backgroundColor: BLACK,
    transform: "rotate(45deg)",
  },
  geoTL_Red: {
    position: "absolute",
    top: -20,
    left: 18,
    width: 100,
    height: 100,
    backgroundColor: RED,
    transform: "rotate(45deg)",
  },
  geoTL_Yellow: {
    position: "absolute",
    top: 58,
    left: 4,
    width: 78,
    height: 9,
    backgroundColor: YELLOW,
    transform: "rotate(-32deg)",
  },

  // === Geometric corner accents — bottom-right (mirror) ===
  geoBR_Black: {
    position: "absolute",
    bottom: -55,
    right: -55,
    width: 150,
    height: 150,
    backgroundColor: BLACK,
    transform: "rotate(45deg)",
  },
  geoBR_Red: {
    position: "absolute",
    bottom: -20,
    right: 18,
    width: 100,
    height: 100,
    backgroundColor: RED,
    transform: "rotate(45deg)",
  },
  geoBR_Yellow: {
    position: "absolute",
    bottom: 58,
    right: 4,
    width: 78,
    height: 9,
    backgroundColor: YELLOW,
    transform: "rotate(-32deg)",
  },

  // Header: logo left, cert ID right
  header: {
    position: "absolute",
    top: 40,
    left: 52,
    right: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { width: 120, height: 38, objectFit: "contain" },
  certIdBlock: { alignItems: "flex-end" },
  certIdLabel: {
    fontSize: 6.5,
    color: LIGHT_GRAY,
    fontWeight: 600,
    letterSpacing: 1.5,
  },
  certIdValue: {
    fontSize: 7.5,
    color: GRAY,
    fontWeight: 400,
    marginTop: 3,
  },

  // Red separator lines around the title
  titleSepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 22,
  },
  titleSepLine: { flex: 1, height: 1, backgroundColor: RED },
  titleText: {
    fontSize: 9,
    fontWeight: 700,
    color: RED,
    letterSpacing: 3,
  },

  // Centered body column
  body: {
    position: "absolute",
    top: 100,
    left: 52,
    right: 52,
    bottom: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: {
    fontSize: 8,
    color: LIGHT_GRAY,
    fontWeight: 600,
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  holderCompany: {
    fontSize: 9,
    color: GRAY,
    fontWeight: 700,
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  holderDni: {
    fontSize: 9,
    color: GRAY,
    fontWeight: 600,
    letterSpacing: 1,
    marginTop: -10,
    marginBottom: 14,
  },

  awardedTo: {
    fontSize: 9,
    color: GRAY,
    fontWeight: 400,
    marginBottom: 8,
    letterSpacing: 1,
  },
  studentName: {
    fontSize: 34,
    fontFamily: "Playfair Display",
    fontWeight: 700,
    color: DARK,
    marginBottom: 6,
    textAlign: "center",
  },
  nameLine: {
    width: 300,
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 18,
  },
  courseLabel: {
    fontSize: 8,
    color: GRAY,
    fontWeight: 400,
    marginBottom: 8,
    letterSpacing: 1,
  },
  courseTitle: {
    fontSize: 14,
    fontFamily: "Montserrat",
    fontWeight: 700,
    color: RED,
    textAlign: "center",
    maxWidth: 460,
    marginBottom: 6,
  },
  courseDescription: {
    fontSize: 10,
    color: GRAY,
    fontWeight: 400,
    textAlign: "center",
    maxWidth: 380,
    marginBottom: 22,
  },

  // Divider: — ◆ —
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 22,
  },
  dividerLine: { width: 40, height: 1.5, backgroundColor: "#d1d5db" },
  dividerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: "#f59e0b",
    transform: "rotate(45deg)",
  },

  // Signatories
  signatoriesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
  },
  signatoryItem: { alignItems: "center", width: 130 },
  signatoryScript: {
    fontSize: 14,
    fontFamily: "Playfair Display",
    fontWeight: 400,
    color: DARK,
    marginBottom: 4,
    textAlign: "center",
  },
  signatoryLine: {
    width: 110,
    height: 1,
    backgroundColor: "#d1d5db",
    marginBottom: 5,
  },
  signatoryName: {
    fontSize: 7,
    fontWeight: 700,
    color: DARK,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  signatoryTitle: {
    fontSize: 6.5,
    fontWeight: 400,
    color: RED,
    textAlign: "center",
    marginTop: 2,
    letterSpacing: 0.3,
  },

  // Bottom bar: left info + right QR
  bottomBar: {
    position: "absolute",
    bottom: 36,
    left: 52,
    right: 52,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  dateBlock: {},
  infoLabel: {
    fontSize: 6,
    color: LIGHT_GRAY,
    fontWeight: 600,
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
    fontWeight: 600,
    color: "#16a34a",
  },
  // Sello (centered at base)
  selloBlock: {
    position: "absolute",
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  selloImage: {
    width: 90,
    height: 90,
    objectFit: "contain",
  },

  // QR block
  qrBlock: { alignItems: "center" },
  qrImage: { width: 60, height: 60, marginBottom: 4 },
  qrLabel: {
    fontSize: 6,
    color: GRAY,
    fontWeight: 600,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  verifyUrl: {
    fontSize: 5,
    color: RED,
    fontWeight: 400,
    textAlign: "center",
    maxWidth: 110,
    marginTop: 2,
  },
  verifiedBadge: {
    fontSize: 5.5,
    color: LIGHT_GRAY,
    fontWeight: 400,
    textAlign: "center",
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

type Props = {
  studentName: string;
  studentDni?: string | null;
  studentCompany?: string | null;
  courseTitle: string;
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
  "Por haber completado satisfactoriamente el programa de capacitación profesional, demostrando dominio en los conceptos y prácticas del sector.";

const SIGNATORIES = [
  { script: "L. Rivera", name: "ING. LEWIS RIVERA VILLACREZ", title: "INSTRUCTOR" },
  { script: "R. Soria", name: "ROSA SORIA LOPEZ", title: "ADMINISTRADORA" },
  { script: "D. Leyva", name: "DEISY LEYVA ARANA", title: "COORDINADORA" },
];

export function CertificatePDF({
  studentName,
  studentDni,
  studentCompany,
  courseTitle,
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
    description && description.trim() !== "" ? description : DEFAULT_DESCRIPTION;
  return (
    <Document
      title={`Certificado — ${courseTitle}`}
      author="RIVISIG Consultores"
      subject={`Certificado de aprobación: ${courseTitle}`}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Watermark — icon at ~8% opacity behind everything */}
        <Image style={styles.watermark} src={iconBase64} />

        {/* Geometric corner accents — top-left */}
        <View style={styles.geoTL_Black} />
        <View style={styles.geoTL_Red} />
        <View style={styles.geoTL_Yellow} />

        {/* Geometric corner accents — bottom-right (mirror) */}
        <View style={styles.geoBR_Black} />
        <View style={styles.geoBR_Red} />
        <View style={styles.geoBR_Yellow} />

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

          {/* Title with red separator lines */}
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

          <Text style={styles.courseLabel}>POR HABER COMPLETADO EXITOSAMENTE EL CURSO</Text>
          <Text style={styles.courseTitle}>{courseTitle}</Text>
          <Text style={styles.courseDescription}>{resolvedDescription}</Text>

          {/* Divider: — ◆ — */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDiamond} />
            <View style={styles.dividerLine} />
          </View>

          {/* Signatories */}
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

        {/* Sello centered at base */}
        <View style={styles.selloBlock}>
          <Image style={styles.selloImage} src={selloBase64} />
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <View style={styles.dateBlock}>
            <Text style={styles.infoLabel}>FECHA DE EMISIÓN</Text>
            <Text style={styles.infoValue}>{formatDate(issueDate)}</Text>

            <Text style={styles.infoLabel}>VIGENCIA</Text>
            {expiresAt ? (
              <Text style={styles.expiryValue}>Hasta {formatDate(expiresAt)}</Text>
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
