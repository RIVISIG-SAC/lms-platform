import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  Award,
  UserCircle,
  LifeBuoy,
  ChevronLeft,
  Compass,
  PlayCircle,
  FileCheck,
  Bell,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Guía del estudiante | RIVISIG" };

type GuideSection = {
  icon: typeof BookOpen;
  title: string;
  description: string;
  steps: string[];
  cta?: { label: string; href: string };
};

const sections: GuideSection[] = [
  {
    icon: Compass,
    title: "Cómo navegar tu panel",
    description:
      "Tu panel agrupa toda tu actividad de aprendizaje en un solo lugar. Desde el menú lateral puedes acceder a tus cursos, certificados y perfil.",
    steps: [
      "Inicio: vista general con tu progreso y atajos.",
      "Mis Cursos: cursos en los que estás inscrito y avance por cada uno.",
      "Certificados: documentos disponibles para descargar y verificar.",
      "Mi Perfil: datos personales, contraseña y preferencias de cuenta.",
    ],
  },
  {
    icon: PlayCircle,
    title: "Cómo continuar un curso",
    description:
      "Tu progreso se guarda automáticamente. Puedes retomar desde donde lo dejaste en cualquier momento.",
    steps: [
      "Entra a 'Mis Cursos' y elige el curso que quieres continuar.",
      "El curso se abre en la última lección visitada.",
      "Marca las lecciones como vistas para registrar tu avance.",
      "El porcentaje de avance se actualiza en tiempo real.",
    ],
    cta: { label: "Ir a mis cursos", href: "/student/my-courses" },
  },
  {
    icon: FileCheck,
    title: "Cómo rendir el examen final",
    description:
      "Una vez completes el 100% del contenido del curso, se habilita el examen final para acreditar tus conocimientos.",
    steps: [
      "Completa todas las lecciones del curso (avance del 100%).",
      "Desde la página del curso aparecerá el botón 'Rendir examen'.",
      "Responde todas las preguntas dentro del tiempo asignado.",
      "Si apruebas, se genera tu certificado automáticamente.",
    ],
  },
  {
    icon: Award,
    title: "Cómo descargar y verificar tu certificado",
    description:
      "Tu certificado es digital, descargable en PDF y cuenta con un código verificable público.",
    steps: [
      "Entra a 'Certificados' desde el menú lateral.",
      "Pulsa 'Descargar' en el certificado correspondiente.",
      "Comparte el enlace de verificación con quien lo solicite.",
      "Cualquier persona puede validar la autenticidad en /verificar.",
    ],
    cta: { label: "Ver mis certificados", href: "/student/certificates" },
  },
  {
    icon: UserCircle,
    title: "Cómo actualizar tu perfil",
    description:
      "Mantén tus datos al día para que tus certificados se emitan con la información correcta.",
    steps: [
      "Ve a 'Mi Perfil' desde el menú lateral.",
      "Actualiza tu nombre, foto, DNI o empresa cuando corresponda.",
      "Cambia tu contraseña periódicamente para mantener tu cuenta segura.",
      "Recuerda guardar los cambios antes de salir.",
    ],
    cta: { label: "Ir a mi perfil", href: "/student/profile" },
  },
  {
    icon: Bell,
    title: "Buenas prácticas",
    description:
      "Pequeños hábitos que te ayudarán a aprovechar mejor cada curso.",
    steps: [
      "Estudia en bloques cortos y constantes en lugar de sesiones largas y esporádicas.",
      "Toma notas mientras avanzas: refuerza la retención.",
      "Revisa los recursos descargables de cada capítulo.",
      "Si te quedas sin internet, recuerda que tu progreso vuelve a sincronizar al reconectar.",
    ],
  },
  {
    icon: LifeBuoy,
    title: "¿Necesitas ayuda?",
    description:
      "Si algo no funciona como esperas o tienes dudas que la FAQ no resuelve, contáctanos.",
    steps: [
      "Revisa primero la sección de FAQ y Ayuda.",
      "Si no encuentras la respuesta, usa el botón 'Contactar tutor' del panel.",
      "Te responderemos al correo con el que iniciaste sesión.",
    ],
    cta: { label: "Ir a FAQ", href: "/student/faq" },
  },
];

export default function StudentGuidePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="size-3.5" /> Volver al panel
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
            <BookOpen className="size-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Soporte</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
              Guía del estudiante
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Todo lo que necesitas saber para aprovechar tu experiencia de aprendizaje en RIVISIG:
              cómo navegar el panel, completar tus cursos y obtener tu certificado.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {sections.map(({ icon: Icon, title, description, steps, cta }) => (
          <Card key={title} className="border border-border shadow-sm flex flex-col">
            <CardContent className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/15 shrink-0">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{title}</h2>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
                </div>
              </div>
              <ol className="space-y-2 pl-1 flex-1">
                {steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/90 leading-relaxed">
                    <span className="inline-flex shrink-0 size-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              {cta && (
                <Link
                  href={cta.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-auto"
                >
                  {cta.label} <GraduationCap className="size-3.5" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
