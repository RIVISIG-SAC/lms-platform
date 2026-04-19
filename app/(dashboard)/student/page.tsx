import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Award, 
  ChevronRight, 
  Library, 
  GraduationCap,
  TrendingUp,
  Sparkles
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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-primary/10 rounded-3xl p-8 border border-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-3">
            <Sparkles className="size-4" />
            <span>Zona de Estudiante</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">
            ¡Hola de nuevo, {session.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground font-medium max-w-lg mb-6 text-sm">
            Estás haciendo un excelente trabajo con tu formación. Hoy es un buen día para avanzar un poco más en tu camino profesional.
          </p>
          <div className="flex gap-4">
            <Link href="/student/my-courses" className={cn(buttonVariants(), "rounded-full px-6 shadow-lg shadow-primary/20 font-bold")}>
              Ir a mis cursos
            </Link>
            <Link href="/student/catalog" className={cn(buttonVariants({ variant: "ghost" }), "rounded-full px-6 font-bold flex items-center gap-2")}>
              Explorar catálogo <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-[-5%] bottom-[-20%] size-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute right-[10%] top-[-10%] size-32 bg-primary/20 rounded-full blur-2xl" />
        <GraduationCap className="absolute right-12 top-1/2 -translate-y-1/2 size-48 text-primary/5 -rotate-12 hidden lg:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Progress & Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-none shadow-xl shadow-black/5 bg-card/60 backdrop-blur-md overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shadow-sm">
                    <BookOpen className="size-6" />
                  </div>
                  <TrendingUp className="size-5 text-emerald-500 opacity-50" />
                </div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Cursos en Marcha</h3>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-4xl font-black text-foreground">{enrollmentsCount}</span>
                  <span className="text-xs text-muted-foreground font-bold mb-1.5 uppercase">Activos</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-black/5 bg-card/60 backdrop-blur-md overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200 shadow-sm">
                    <Award className="size-6" />
                  </div>
                  <Sparkles className="size-5 text-amber-500 opacity-50" />
                </div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Certificados</h3>
                <div className="flex items-end gap-2 mt-1">
                  <span className="text-4xl font-black text-foreground">{certificatesCount}</span>
                  <span className="text-xs text-muted-foreground font-bold mb-1.5 uppercase">Logrados</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Continue Learning Feature */}
          {lastEnrollment && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                Continuar aprendiendo
              </h2>
              <Card className="border border-border/50 shadow-lg shadow-black/5 overflow-hidden group">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 bg-accent/50 p-4 flex items-center justify-center border-r border-border/50">
                    <div className="aspect-video w-full rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden relative">
                      {lastEnrollment.course.thumbnailUrl ? (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img src={lastEnrollment.course.thumbnailUrl} alt="" className="object-cover w-full h-full" />
                      ) : (
                        <BookOpen className="size-8 text-primary/40" />
                      )}
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ChevronRight className="size-8 text-white scale-75 group-hover:scale-100 transition-transform" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-6 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {lastEnrollment.course.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
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
                    <div className="flex justify-end">
                      <Link href={`/student/courses/${lastEnrollment.courseId}`} className={cn(buttonVariants({ size: "sm" }), "font-bold")}>
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
          <Card className="border-none shadow-xl shadow-black/5 bg-primary overflow-hidden text-primary-foreground relative group">
            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-lg font-bold">Nuevas Oportunidades</CardTitle>
              <CardDescription className="text-primary-foreground/70 font-medium">
                Explora cursos recomendados para ti según tu perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Link href="/student/catalog" className={cn(buttonVariants({ variant: "secondary" }), "w-full font-bold shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2")}>
                <Library className="size-4" /> Ir al Catálogo
              </Link>
            </CardContent>
            {/* Background pattern */}
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-1/4 -translate-y-1/4">
              <Library className="size-48 rotate-12" />
            </div>
          </Card>

          <Card className="border-none shadow-xl shadow-black/5 bg-card/60 backdrop-blur-md">
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
