import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { formatDate } from "./utils";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    padding: 60,
    fontFamily: "Helvetica",
    position: "relative",
  },
  border: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    border: "3px solid #1e293b",
  },
  innerBorder: {
    position: "absolute",
    top: 26,
    left: 26,
    right: 26,
    bottom: 26,
    border: "1px solid #94a3b8",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  company: {
    fontSize: 10,
    color: "#64748b",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 40,
    letterSpacing: 1,
  },
  awardedTo: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 10,
  },
  studentName: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    marginBottom: 8,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 12,
    minWidth: 300,
    textAlign: "center",
  },
  courseLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 20,
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
    textAlign: "center",
    maxWidth: 400,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: "#1e40af",
    marginTop: 30,
    marginBottom: 30,
  },
  metaRow: {
    flexDirection: "row",
    gap: 60,
    marginTop: 10,
  },
  metaItem: {
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 9,
    color: "#94a3b8",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 11,
    color: "#1e293b",
    fontFamily: "Helvetica-Bold",
  },
  code: {
    position: "absolute",
    bottom: 40,
    right: 60,
    fontSize: 8,
    color: "#94a3b8",
    fontFamily: "Helvetica",
  },
  verifyText: {
    position: "absolute",
    bottom: 40,
    left: 60,
    fontSize: 8,
    color: "#94a3b8",
  },
  score: {
    fontSize: 11,
    color: "#16a34a",
    fontFamily: "Helvetica-Bold",
  },
  expiresValue: {
    fontSize: 11,
    color: "#dc2626",
    fontFamily: "Helvetica-Bold",
  },
  noExpiryValue: {
    fontSize: 11,
    color: "#16a34a",
    fontFamily: "Helvetica-Bold",
  },
});

type Props = {
  studentName: string;
  courseTitle: string;
  issueDate: Date;
  verificationCode: string;
  score: number;
  expiresAt?: Date | null;
};

export function CertificatePDF({ studentName, courseTitle, issueDate, verificationCode, score, expiresAt }: Props) {
  return (
    <Document
      title={`Certificado — ${courseTitle}`}
      author="Cursos Pro"
      subject={`Certificado de aprobación: ${courseTitle}`}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border} />
        <View style={styles.innerBorder} />

        <View style={styles.content}>
          <Text style={styles.company}>Cursos Pro · Plataforma de Capacitación Profesional</Text>
          <Text style={styles.title}>CERTIFICADO</Text>
          <Text style={styles.subtitle}>DE APROBACIÓN</Text>

          <Text style={styles.awardedTo}>Se certifica que</Text>
          <Text style={styles.studentName}>{studentName}</Text>

          <Text style={styles.courseLabel}>ha completado y aprobado satisfactoriamente el curso</Text>
          <Text style={styles.courseName}>{courseTitle}</Text>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Fecha de emisión</Text>
              <Text style={styles.metaValue}>{formatDate(issueDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Calificación</Text>
              <Text style={[styles.metaValue, styles.score]}>{score.toFixed(0)}%</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Código de verificación</Text>
              <Text style={styles.metaValue}>{verificationCode}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Vigencia</Text>
              {expiresAt ? (
                <Text style={styles.expiresValue}>Hasta {formatDate(expiresAt)}</Text>
              ) : (
                <Text style={styles.noExpiryValue}>Sin vencimiento</Text>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.verifyText}>
          Verificar en: cursospro.com/verificar/{verificationCode}
        </Text>
        <Text style={styles.code}>Documento generado digitalmente · No requiere firma física</Text>
      </Page>
    </Document>
  );
}
