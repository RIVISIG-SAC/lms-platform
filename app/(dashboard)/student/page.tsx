import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Award,
  ChevronRight,
  Clock3,
  Globe,
  GraduationCap,
  TrendingUp,
  Target,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export default async function StudentHomePage() {
  const session = await getRequiredSession();

  const [enrollmentsCount, certificatesCount, lastEnrollment] = await Promise.all([
    prisma.enrollment.count({
      where: { userId: session.userId, status: { in: ["PAID", "COMPLETED"] } },
    }),
    prisma.certificate.count({
      where: { enrollment: { userId: session.userId }, status: "ACTIVE" },
    }),
    prisma.enrollment.findFirst({
      where: { userId: session.userId, status: "PAID" },
      orderBy: { updatedAt: "desc" },
      include: { course: true }
    })
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Panel del estudiante</p>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
              Hola, {session.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Revisa tu avance, continua tus clases y gestiona tus certificados desde un solo lugar.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 w-full md:w-auto">
            <Link href="/student/my-courses" className={cn(buttonVariants(), "font-bold w-full sm:w-auto")}>Ir a mis cursos</Link>
            <Link href="/cursos" className={cn(buttonVariants({ variant: "outline" }), "font-bold gap-2 w-full sm:w-auto justify-center")}>Explorar cursos <ChevronRight className="size-4" /></Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content: Progress & Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="border border-border/70 shadow-sm bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 border border-blue-200">
                    <BookOpen className="size-6" />
                  </div>
                  <TrendingUp className="size-5 text-blue-500/70" />
                </div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Cursos activos</h3>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-foreground">{enrollmentsCount}</span>
                  <span className="text-xs text-muted-foreground font-semibold mb-1.5 uppercase">en progreso</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/70 shadow-sm bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 border border-amber-200">
                    <Award className="size-6" />
                  </div>
                  <CheckCircle2 className="size-5 text-amber-600/70" />
                </div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Certificados</h3>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-foreground">{certificatesCount}</span>
                  <span className="text-xs text-muted-foreground font-semibold mb-1.5 uppercase">disponibles</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue Learning Feature */}
          {lastEnrollment && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock3 className="size-5 text-primary" />
                Continua donde te quedaste
              </h2>
              <Card className="border border-border shadow-sm overflow-hidden group">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-52 bg-muted/30 p-3 sm:p-4 flex items-center justify-center border-b md:border-b-0 border-r-0 md:border-r border-border/60">
                    <div className="aspect-video w-full rounded-lg bg-primary/5 flex items-center justify-center border border-primary/15 overflow-hidden relative">
                      {lastEnrollment.course.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                        <img src={lastEnrollment.course.thumbnailUrl} alt="" className="object-cover w-full h-full" />
                      ) : (
                        <BookOpen className="size-8 text-primary/40" />
                      )}
                      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ChevronRight className="size-8 text-white scale-75 group-hover:scale-100 transition-transform" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 sm:p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {lastEnrollment.course.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary uppercase bg-primary/10 px-2 py-1 rounded">
                          {Math.round(lastEnrollment.progressPercentage)}% completado
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000"
                          style={{ width: `${lastEnrollment.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-stretch sm:justify-end">
                      <Link href={`/student/courses/${lastEnrollment.courseId}`} className={cn(buttonVariants({ size: "sm" }), "font-bold w-full sm:w-auto")}>
                        Reanudar clase
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar for Student Dashboard */}
        <div className="space-y-6">
          <Card className="border border-border shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2"><Target className="size-5 text-primary" /> Acciones rápidas</CardTitle>
              <CardDescription className="font-medium">
                Atajos para continuar tu flujo de aprendizaje.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/student/my-courses" className={cn(buttonVariants(), "w-full justify-start gap-2 font-semibold min-h-11")}>
                <GraduationCap className="size-4" /> Continuar cursos
              </Link>
              <Link href="/student/certificates" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-start gap-2 font-semibold min-h-11")}>
                <Award className="size-4" /> Ver certificados
              </Link>
              <Link href="/cursos" className={cn(buttonVariants({ variant: "ghost" }), "w-full justify-start gap-2 font-semibold min-h-11")}>
                <Globe className="size-4" /> Explorar nuevos cursos
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm bg-card">
            <CardHeader className="pb-3 px-6">
              <CardTitle className="text-base font-bold">Soporte y Recursos</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-2">
              <Link href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors group">
                <span className="text-sm font-medium">Guía del estudiante</span>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
              </Link>
              <Link href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors group">
                <span className="text-sm font-medium">FAQ y Ayuda</span>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
              </Link>
              <Link href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors group">
                <span className="text-sm font-medium">Contactar tutor</span>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
