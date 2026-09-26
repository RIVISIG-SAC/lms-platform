import type { PaymentStatusCopy } from "@/components/payments/PaymentStatusOverlay";

export function coursePaymentCopy(courseTitle?: string): PaymentStatusCopy {
  return {
    processing: ["Procesando tu pago…", "Preparando tu curso…"],
    successTitle: "¡Pago exitoso!",
    successDescription: courseTitle
      ? `Ya tienes acceso a “${courseTitle}”. Te llevamos a tu curso…`
      : "Ya tienes acceso. Te llevamos a tu curso…",
    continueLabel: "Ir al curso ahora",
    uncertainHref: "/student/my-courses",
    uncertainLabel: "Mis cursos",
  };
}

export const CERTIFICATE_PAYMENT_COPY: PaymentStatusCopy = {
  processing: ["Procesando tu pago…", "Generando tu certificado…"],
  successTitle: "¡Certificado listo!",
  successDescription: "Tu pago se registró y tu certificado ya está disponible.",
  continueLabel: "Ver mi certificado",
  uncertainHref: "/student/certificates",
  uncertainLabel: "Mis certificados",
};
