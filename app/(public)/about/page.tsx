import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  ShieldCheck,
  ClipboardList,
  BookOpen,
  Search,
  HardHat,
  Building2,
  Users,
  Cpu,
  Landmark,
  UtensilsCrossed,
} from 'lucide-react';

export const metadata = {
  title: 'Quiénes somos — RIVISIG Consultores',
  description:
    'Consultora especializada en implementación, certificación y soporte de Sistemas de Gestión ISO orientada a empresas que requieren cumplimiento normativo real.',
};

const problemas = [
  'Obtienen certificaciones que no resisten auditorías reales',
  'Fallan en homologaciones y fiscalizaciones',
  'Cumplen solo de forma documental, sin operación real',
  'Asumen riesgos legales y operativos innecesarios',
];

const pilares = [
  {
    icon: ShieldCheck,
    title: 'Cumplimiento real',
    desc: 'Sistemas que resisten auditorías externas y fiscalizaciones sin depender de documentación vacía.',
  },
  {
    icon: ClipboardList,
    title: 'Enfoque técnico y legal',
    desc: 'Alineados a requisitos normativos, legales y a las exigencias específicas de tus clientes.',
  },
  {
    icon: BookOpen,
    title: 'Capacitación incluida',
    desc: 'Formamos a tu equipo para operar el sistema de forma autónoma, sin dependencia externa.',
  },
  {
    icon: Search,
    title: 'Soporte postcertificación',
    desc: 'Te acompañamos en el mantenimiento del sistema y en renovaciones periódicas.',
  },
];

const sectores = [
  { icon: HardHat, label: 'Construcción' },
  { icon: Building2, label: 'Inmobiliario' },
  { icon: Users, label: 'Servicios especializados' },
  { icon: Cpu, label: 'Tecnología / servicios web' },
  { icon: Landmark, label: 'Empresas proveedoras del Estado' },
  { icon: UtensilsCrossed, label: 'Industria alimentaria' },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Quiénes somos */}
      <section>
        <Badge
          variant="outline"
          className="mb-4 border-primary/30 text-primary bg-primary/5 text-xs font-medium px-3 py-1"
        >
          Quiénes somos
        </Badge>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground leading-tight mb-6">
              Solidez, confianza y respaldo real en sistemas de gestión
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Somos una consultora especializada en{' '}
              <strong className="text-foreground">
                implementación, certificación y soporte
              </strong>{' '}
              de Sistemas de Gestión, orientada a empresas que requieren
              confianza real, cumplimiento normativo y respaldo ante auditorías,
              clientes y autoridades.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              No nos limitamos a generar documentos: diseñamos sistemas que
              funcionan en la práctica, que resisten auditorías externas y que
              tu equipo puede operar con autonomía.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pilares.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-border p-5 space-y-2"
              >
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* El problema que resolvemos */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          El problema que resolvemos
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 max-w-2xl">
          Muchas empresas obtienen certificaciones que no resisten la realidad
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-3xl">
          {problemas.map((p) => (
            <div
              key={p}
              className="flex items-start gap-3 text-muted-foreground text-sm"
            >
              <span className="mt-1 h-4 w-4 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              </span>
              {p}
            </div>
          ))}
        </div>
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-5 max-w-2xl">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground font-medium">
            En RIVISIG cerramos esas brechas. Implementamos sistemas reales,
            operativos y auditables — no solo documentación.
          </p>
        </div>
      </section>

      <Separator />

      {/* Sectores atendidos */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          Sectores atendidos
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
          Experiencia en múltiples industrias
        </h2>
        <div className="flex flex-wrap gap-3">
          {sectores.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white border border-border rounded-full px-4 py-2 text-sm text-muted-foreground"
            >
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
