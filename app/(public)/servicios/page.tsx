import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageSlot } from "@/components/public/ImageSlot";
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
    imgKey: "homologaciones",
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
    imgKey: "sst",
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
    imgKey: "auditorias",
  },
];

export default function ServiciosPage() {
  return (
    <>
      {/* Hero con banner */}
      <section className="relative border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge
                variant="outline"
                className="mb-4 border-primary/30 text-primary bg-primary/5 text-xs font-medium px-3 py-1"
              >
                Servicios
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mb-5">
                Implementación y certificación ISO
              </h1>
              <p className="text-muted-foreground leading-relaxed max-w-xl">
                Trabajamos con los principales estándares internacionales de sistemas de gestión,
                de forma individual o integrada (multinorma). Acompañamiento total desde el
                diagnóstico hasta la auditoría externa.
              </p>
            </div>

            {/* === IMAGE SLOT: Banner de servicios ===
                Archivo esperado: /public/images/servicios/banner.jpg
                Sugerencia: foto de consultoría en planta, sala de reuniones o capacitación corporativa. */}
            <ImageSlot
              src="/images/servicios/banner.jpg"
              alt="Consultoría RIVISIG en sitio"
              aspect="aspect-[4/3]"
              rounded="rounded-2xl"
              hint="Banner página de servicios."
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Normas */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Normas que implementamos
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
            Estándares internacionales ISO
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {normas.map((s) => (
              <div key={s.norma} className="border border-border rounded-xl p-5 bg-white hover:border-primary/40 hover:shadow-sm transition-all space-y-2">
                <p className="text-sm font-bold text-primary">{s.norma}</p>
                <p className="text-xs font-semibold text-foreground">{s.nombre}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* Servicios adicionales con imagen cada uno */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Servicios complementarios
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
            Soporte técnico y operativo
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {serviciosAdicionales.map(({ icon: Icon, title, items, imgKey }) => (
              <div key={title} className="border border-border rounded-xl bg-white overflow-hidden flex flex-col">
                {/* === IMAGE SLOT: Servicio complementario ===
                    Archivo esperado: /public/images/servicios/{imgKey}.jpg
                    Una foto representativa por cada servicio. */}
                <ImageSlot
                  src={`/images/servicios/${imgKey}.jpg`}
                  alt={title}
                  aspect="aspect-[16/9]"
                  rounded="rounded-none"
                  className="border-0 border-b"
                  hint={`Imagen servicio: ${title}`}
                />
                <div className="p-6 space-y-4 flex-1">
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
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
