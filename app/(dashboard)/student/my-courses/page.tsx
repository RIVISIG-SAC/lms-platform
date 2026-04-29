import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  History,
  Award,
  Calendar,
  ChevronRight,
  Library,
  GraduationCap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Mis Cursos | Cursos Pro" };

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: any }> = {
  PAID: { label: "En progreso", class: "bg-blue-100 text-blue-700", icon: Clock },
  COMPLETED: { label: "Completado", class: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  EXPIRED: { label: "Expirado", class: "bg-slate-100 text-slate-500", icon: History },
  FAILED: { label: "No aprobado", class: "bg-red-100 text-red-600", icon: AlertCircle },
  PENDING: { label: "Pendiente", class: "bg-amber-100 text-amber-700", icon: Clock },
};

export default async function StudentMyCoursesPage() {
  const session = await getRequiredSession();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId, status: { not: "PENDING" } },
    orderBy: { startDate: "desc" },
    include: {
      course: {
        include: { _count: { select: { modules: true } } },
      },
      certificate: { select: { verificationCode: true, status: true } },
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Mis Cursos
          </h1>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            Gestionas {enrollments.length} {enrollments.length === 1 ? "inscripción activa" : "inscripciones activas"}
          </p>
        </div>
        <Link href="/student/catalog" className={cn(buttonVariants({ variant: "outline" }), "rounded-full border-2 font-bold group")}>
          <PlusCircleIcon className="size-4 group-hover:rotate-90 transition-transform duration-300" /> Explorar nuevos cursos
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-border/60 rounded-3xl bg-accent/5 max-w-2xl mx-auto">
          <GraduationCap className="size-16 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Tu aula está vacía</h2>
          <p className="text-muted-foreground max-w-xs mx-auto mb-8 font-medium">
            Parece que aún no te has inscrito en ningún curso. ¡Tu próxima meta profesional te espera!
          </p>
          <Link href="/student/catalog" className={cn(buttonVariants({ size: "lg" }), "rounded-full font-bold shadow-lg shadow-primary/20")}>
            Ver catálogo de cursos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {enrollments.map((enrollment) => {
            const { course } = enrollment;
            const status = STATUS_CONFIG[enrollment.status] ?? STATUS_CONFIG.PENDING;
            const StatusIcon = status.icon;
            const isActive = enrollment.status === "PAID" || enrollment.status === "COMPLETED";

            return (
              <Card key={enrollment.id} className="border-none shadow-xl shadow-black/5 bg-card/60 backdrop-blur-md overflow-hidden group hover:bg-card/80 transition-all duration-300">
                <div className="flex flex-col items-center md:flex-row">
                  {/* Course visual hint */}
                  <div className="md:w-64 aspect-video md:aspect-auto self-stretch bg-accent/50 flex items-center justify-center border-r border-border/20 overflow-hidden relative">
                    {course.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.thumbnailUrl} alt="" className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <Library className="size-12 text-primary/20" />
                    )}
                    {/* Progress overlay for active courses */}
                    {enrollment.status === "PAID" && (
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20">
                        <div className="h-full bg-primary" style={{ width: `${enrollment.progressPercentage}%` }} />
                      </div>
                    )}
                  </div>

                  {/* Course Details */}
                  <div className="flex-1 p-6 flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={`border-none ${status.class} font-bold text-[10px] uppercase flex items-center gap-1 px-2 py-0.5`}>
                            <StatusIcon className="size-3" /> {status.label}
                          </Badge>
                          {enrollment.certificate?.status === "ACTIVE" && (
                            <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[10px] uppercase flex items-center gap-1 px-2 py-0.5">
                              <Award className="size-3" /> Certificado
                            </Badge>
                          )}
                          {enrollment.certificate?.status === "PENDING_PAYMENT" && (
                            <Badge className="bg-orange-100 text-orange-700 border-none font-bold text-[10px] uppercase flex items-center gap-1 px-2 py-0.5">
                              <Award className="size-3" /> Certificado pendiente
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                      </div>

                      {/* Course Progress or Dates */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-4 opacity-70" />
                          <span>Desde {formatDate(enrollment.startDate)}</span>
                        </div>
                        {isActive && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-4 opacity-70" />
                            <span>Vence {formatDate(enrollment.endDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      {enrollment.status === "PAID" && (
                        <div className="space-y-2 pt-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <span>Progreso Académico</span>
                            <span className="text-primary">{Math.round(enrollment.progressPercentage)}%</span>
                          </div>
                          <div className="h-2 bg-accent rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${enrollment.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col justify-end gap-3 sm:min-w-[140px]">
                      {isActive ? (
                        <Link href={`/student/courses/${course.id}`} className={cn(buttonVariants(), "w-full font-black shadow-lg shadow-primary/20 gap-2")}>
                          {enrollment.status === "COMPLETED" ? (
                            <><CheckCircle2 className="size-4" /> Repasar</>
                          ) : (
                            <><Play className="size-4 fill-current" /> {enrollment.progressPercentage > 0 ? "Continuar" : "Iniciar"}</>
                          )}
                        </Link>
                      ) : (
                        <Link href={`/student/catalog/${course.id}`} className={cn(buttonVariants({ variant: "outline" }), "w-full font-bold")}>
                          Inscribirse
                        </Link>
                      )}
                      
                      {enrollment.certificate?.status === "ACTIVE" && (
                        <a
                          href={`/api/certificates/${enrollment.certificate.verificationCode}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full font-bold hover:bg-amber-50 hover:text-amber-700 gap-2")}
                        >
                          <Award className="size-4" /> Certificado
                        </a>
                      )}
                      {enrollment.certificate?.status === "PENDING_PAYMENT" && (
                        <Link
                          href={`/student/courses/${course.id}/exam`}
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full font-bold hover:bg-orange-50 hover:text-orange-700 gap-2")}
                        >
                          <Award className="size-4" /> Pagar certificado
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/>
    </svg>
  );
}
