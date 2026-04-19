import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight, 
  Plus, 
  TrendingUp, 
  Monitor,
  MoreVertical,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const [courses, students, certificates, totalRevenue] = await Promise.all([
    prisma.course.count({ where: { published: true } }),
    prisma.enrollment.count({ where: { status: { in: ["PAID", "COMPLETED"] } } }),
    prisma.certificate.count({ where: { status: "ACTIVE" } }),
    // Simulando ingresos para el gráfico si no hay tabla de pagos directa
    Promise.resolve(12580),
  ]);

  const recentCourses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { _count: { select: { enrollments: true } } },
  });

  const stats = [
    { 
      label: "Cursos Activos", 
      value: courses, 
      icon: BookOpen, 
      color: "text-blue-600", 
      bg: "bg-blue-100/50",
      description: "Cursos publicados en la plataforma"
    },
    { 
      label: "Estudiantes", 
      value: students, 
      icon: Users, 
      color: "text-red-600", 
      bg: "bg-red-100/50",
      description: "Inscripciones confirmadas"
    },
    { 
      label: "Certificados", 
      value: certificates, 
      icon: Award, 
      color: "text-amber-600", 
      bg: "bg-amber-100/50",
      description: "Emitidos este mes"
    },
    { 
      label: "Ingresos (Est.)", 
      value: `$${totalRevenue.toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-emerald-600", 
      bg: "bg-emerald-100/50",
      description: "Basado en inscripciones pagas"
    },
  ];

  // Datos simulados para el gráfico de barras sencillo
  const chartData = [45, 52, 38, 65, 48, 70, 62];
  const maxVal = Math.max(...chartData);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Resumen General
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Bienvenido de nuevo. Aquí tienes lo que está pasando hoy en la plataforma.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/courses/new" className={cn(buttonVariants({ size: "sm" }), "font-semibold shadow-sm")}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Curso
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm bg-card/40 hover:bg-card/80 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simple Bar Chart Section */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-card/40">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tendencia de Inscripciones</CardTitle>
            <CardDescription>Ultimos 7 días de actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between gap-2 px-2">
              {chartData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-md transition-all duration-500 relative flex justify-center"
                    style={{ height: `${(val / maxVal) * 100}%` }}
                  >
                    <div className="absolute -top-8 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      {val}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">
                    {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Courses Section */}
        <Card className="border-none shadow-sm bg-card/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold">Cursos Recientes</CardTitle>
              <CardDescription>Últimas adiciones</CardDescription>
            </div>
            <Link href="/admin/courses" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentCourses.length === 0 ? (
              <div className="px-6 py-10 text-center space-y-3">
                <Briefcase className="h-10 w-10 text-muted-foreground/20 mx-auto" />
                <p className="text-sm text-muted-foreground">Nada por aquí aún.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentCourses.map((course) => (
                  <div key={course.id} className="group flex items-center justify-between px-6 py-4 hover:bg-accent/5 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">
                        {course.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant={course.published ? "secondary" : "outline"} className="text-[10px] px-1.5 h-4 font-bold border-none uppercase">
                          {course.published ? "Público" : "Borrador"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">
                          {course._count.enrollments} alumnos
                        </span>
                      </div>
                    </div>
                    <Link href={`/admin/courses/${course.id}`} className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "opacity-0 group-hover:opacity-100 transition-opacity")}>
                      <MoreVertical className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <div className="p-4 border-t border-border/50">
              <Link href="/admin/courses" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full text-xs font-bold uppercase tracking-tight")}>
                Gestionar todo el catálogo
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
