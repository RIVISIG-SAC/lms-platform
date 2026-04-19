import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Award, Users, Leaf, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Servicios — RIVISIG Consultores",
  description:
    "Implementación y certificación ISO 9001, 14001, 45001, 27001, 37001, 21001, 22000, 50001. Homologaciones, SST y auditorías técnicas.",
};

const normas = [
  { norma: "ISO 9001", nombre: "Sistema de Gestión de la Calidad", desc: "Mejora continua de procesos y satisfacción del cliente en cualquier tipo de organización." },
  { norma: "ISO 14001", nombre: "Sistema de Gestión Ambiental", desc: "Control y reducción del impacto ambiental, cumplimiento legal y sostenibilidad operativa." },
  { norma: "ISO 45001", nombre: "Seguridad y Salud en el Trabajo", desc: "Prevención de riesgos laborales y cumplimiento normativo ante SUNAFIL y autoridades." },
  { norma: "ISO 37001", nombre: "Sistema de Gestión Antisoborno", desc: "Controles para prevenir, detectar y responder ante el soborno en la organización." },
  { norma: "ISO 27001", nombre: "Seguridad de la Información", desc: "Protección de activos de información, datos sensibles y continuidad del negocio." },
  { norma: "ISO 21001", nombre: "Organizaciones Educativas", desc: "Sistema de gestión para instituciones educativas orientado a la mejora del aprendizaje." },
  { norma: "ISO 22000", nombre: "Inocuidad de los Alimentos", desc: "Control de peligros en la cadena alimentaria y cumplimiento de requisitos sanitarios." },
  { norma: "ISO 50001", nombre: "Sistema de Gestión de Energía", desc: "Eficiencia energética, reducción de costos y cumplimiento de objetivos de sostenibilidad." },
];

const beneficios = [
  "Acompañamiento total hasta la auditoría de certificación",
  "Sistemas aplicables, no burocráticos",
  "Enfoque técnico, legal y operativo",
  "Implementación integrada (multinorma) disponible",
];

const serviciosAdicionales = [
  {
    icon: Award,
    title: "Soporte para Homologaciones",
    items: [
      "Preparación y revisión de requisitos de homologación",
      "Alineamiento de sistemas de gestión a exigencias del cliente",
      "Soporte documental y técnico",
      "Acompañamiento en procesos de evaluación",
    ],
  },
  {
    icon: Leaf,
    title: "Seguridad y Salud en el Trabajo – Ley 29783",
    items: [
      "Implementación y soporte del SG-SST",
      "Diagnóstico de cumplimiento legal",
      "Elaboración y actualización de IPERC, planes SST, procedimientos y registros",
      "Inducciones, charlas obligatorias y capacitación a supervisores",
      "Enfoque práctico alineado a fiscalizaciones SUNAFIL",
    ],
  },
  {
    icon: Users,
    title: "Auditorías y Evaluaciones Técnicas",
    items: [
      "Auditorías internas y de segunda parte",
      "Evaluación de proveedores y contratistas",
      "Diagnóstico de brechas normativas",
      "Revisión de cumplimiento legal y contractual",
    ],
  },
];

export default function ServiciosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

      {/* Header */}
      <section>
        <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5 text-xs font-medium px-3 py-1">
          Servicios
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-4 max-w-2xl">
          Implementación y certificación ISO
        </h1>
        <p className="text-muted-foreground max-w-2xl leading-relaxed">
          Trabajamos con los principales estándares internacionales de sistemas de gestión,
          de forma individual o integrada (multinorma). Acompañamiento total desde el diagnóstico
          hasta la auditoría externa.
        </p>
      </section>

      {/* Normas */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-6">
          Normas que implementamos
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {normas.map((s) => (
            <div key={s.norma} className="border border-border rounded-xl p-5 bg-white hover:border-primary/40 hover:shadow-sm transition-all space-y-2">
              <p className="text-sm font-bold text-primary">{s.norma}</p>
              <p className="text-xs font-semibold text-foreground">{s.nombre}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Beneficios */}
        <div className="mt-8 bg-muted/30 border border-border rounded-xl p-6">
          <p className="text-sm font-semibold text-foreground mb-4">¿Por qué implementar con RIVISIG?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {beneficios.map((b) => (
              <div key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Servicios adicionales */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-6">
          Servicios complementarios
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {serviciosAdicionales.map(({ icon: Icon, title, items }) => (
            <div key={title} className="border border-border rounded-xl p-6 bg-white space-y-4">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary shrink-0" />
                <h3 className="font-semibold text-sm text-foreground leading-snug">{title}</h3>
              </div>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
