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
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MoreVertical,
  Briefcase,
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PeriodKey = "today" | "7d" | "30d" | "month";

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "7d", label: "7 días" },
  { key: "30d", label: "30 días" },
  { key: "month", label: "Mes actual" },
];

function getRange(period: PeriodKey) {
  const now = new Date();
  const start = new Date(now);

  if (period === "today") {
    start.setHours(0, 0, 0, 0);
    return { start, end: now, days: 1 };
  }

  if (period === "7d") {
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end: now, days: 7 };
  }

  if (period === "30d") {
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end: now, days: 30 };
  }

  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  const monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return { start, end: now, days: monthDays };
}

function buildDailySeries(dates: Date[], days: number) {
  const now = new Date();
  const buckets = new Map<string, number>();

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const dt of dates) {
    const key = new Date(dt).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([key, value]) => {
    const date = new Date(`${key}T00:00:00`);
    return {
      key,
      value,
      label: date.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", ""),
    };
  });
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const periodParam = resolvedSearchParams.period;
  const period: PeriodKey = PERIOD_OPTIONS.some((opt) => opt.key === periodParam)
    ? (periodParam as PeriodKey)
    : "7d";
  const { start, end, days } = getRange(period);

  const [
    publishedCourses,
    draftCourses,
    totalCourses,
    paidEnrollmentsInRange,
    completedInRange,
    totalStudents,
    certificatesInRange,
    enrollmentsInRange,
    recentCourses,
    coursesWithoutModules,
    coursesWithoutExam,
    staleDraftCourses,
  ] = await Promise.all([
    prisma.course.count({ where: { published: true } }),
    prisma.course.count({ where: { published: false } }),
    prisma.course.count(),
    prisma.enrollment.count({
      where: { createdAt: { gte: start, lte: end }, status: { in: ["PAID", "COMPLETED"] } },
    }),
    prisma.enrollment.count({
      where: { updatedAt: { gte: start, lte: end }, status: "COMPLETED" },
    }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.certificate.count({ where: { issueDate: { gte: start, lte: end } } }),
    prisma.enrollment.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { enrollments: true } } },
    }),
    prisma.course.count({ where: { modules: { none: {} } } }),
    prisma.course.count({ where: { questions: { none: {} } } }),
    prisma.course.count({
      where: {
        published: false,
        createdAt: { lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14) },
      },
    }),
  ]);

  const completionRate = paidEnrollmentsInRange > 0
    ? Math.round((completedInRange / paidEnrollmentsInRange) * 100)
    : 0;

  const chartData = buildDailySeries(enrollmentsInRange.map((e) => e.createdAt), days);
  const maxVal = Math.max(1, ...chartData.map((p) => p.value));

  const stats = [
    {
      label: "Inscripciones pagadas",
      value: paidEnrollmentsInRange.toLocaleString("es-ES"),
      icon: CircleDollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-100/70",
      description: "Periodo seleccionado",
    },
    {
      label: "Finalización",
      value: `${completionRate}%`,
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-100/70",
      description: `${completedInRange.toLocaleString("es-ES")} completados`,
    },
    {
      label: "Certificados emitidos",
      value: certificatesInRange.toLocaleString("es-ES"),
      icon: Award,
      color: "text-amber-600",
      bg: "bg-amber-100/70",
      description: "Periodo seleccionado",
    },
    {
      label: "Ingresos",
      value: "No disponible",
      icon: TrendingUp,
      color: "text-muted-foreground",
      bg: "bg-muted",
      description: "Activa tabla de transacciones",
    },
  ];

  const actions = [
    {
      label: "Cursos sin módulos",
      value: coursesWithoutModules,
      icon: ClipboardList,
      href: "/admin/courses",
      tone: coursesWithoutModules > 0 ? "text-amber-700" : "text-emerald-700",
    },
    {
      label: "Cursos sin evaluación",
      value: coursesWithoutExam,
      icon: AlertTriangle,
      href: "/admin/courses",
      tone: coursesWithoutExam > 0 ? "text-amber-700" : "text-emerald-700",
    },
    {
      label: "Borradores > 14 días",
      value: staleDraftCourses,
      icon: Clock3,
      href: "/admin/courses",
      tone: staleDraftCourses > 0 ? "text-red-700" : "text-emerald-700",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard Admin
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Vista combinada de negocio y operación para ejecutar decisiones más rápido.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center rounded-xl border border-border bg-card p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <Link
                key={opt.key}
                href={`/admin?period=${opt.key}`}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  period === opt.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </Link>
            ))}
          </div>
          <Link href="/admin/courses/new" className={cn(buttonVariants({ size: "sm" }), "font-semibold shadow-sm")}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Curso
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Catálogo</CardDescription>
            <CardTitle className="text-2xl">{totalCourses}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            {publishedCourses} publicados · {draftCourses} borradores
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Estudiantes</CardDescription>
            <CardTitle className="text-2xl">{totalStudents.toLocaleString("es-ES")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Usuarios con rol estudiante
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Periodo</CardDescription>
            <CardTitle className="text-2xl">{paidEnrollmentsInRange.toLocaleString("es-ES")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Inscripciones pagadas/completadas
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/70">
          <CardHeader className="pb-2">
            <CardDescription>Calidad</CardDescription>
            <CardTitle className="text-2xl">{completionRate}%</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Tasa de finalización del periodo
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/70 shadow-sm bg-card/70 hover:bg-card transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2 rounded-lg`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/70 shadow-sm bg-card/70">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" /> Tendencia de inscripciones
            </CardTitle>
            <CardDescription>Datos reales del periodo seleccionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-end justify-between gap-2 px-2">
              {chartData.map((point, i) => (
                <div key={point.key} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-md transition-all duration-500 relative flex justify-center"
                    style={{ height: `${(point.value / maxVal) * 100}%` }}
                  >
                    <div className="absolute -top-8 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                      {point.value}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">
                    {days > 14 ? `${i + 1}` : point.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="size-4 text-primary" /> Atención hoy
              </CardTitle>
              <CardDescription>Tareas operativas priorizadas</CardDescription>
            </div>
            <Link href="/admin/courses" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {actions.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-background px-3 py-2.5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("size-4", item.tone)} />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <Badge variant={item.value > 0 ? "outline" : "secondary"} className="font-semibold">
                    {item.value}
                  </Badge>
                </Link>
              );
            })}
            <div className="pt-2">
              <Link href="/admin/courses/new" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full font-semibold")}>
                <Plus className="size-4" /> Crear nuevo curso
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 shadow-sm bg-card/70">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">Cursos recientes</CardTitle>
            <CardDescription>Últimas adiciones al catálogo</CardDescription>
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
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold leading-none group-hover:text-primary transition-colors truncate">
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/courses" className="rounded-xl border border-border/70 bg-card px-4 py-3 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BookOpen className="size-4 text-primary" /> Gestionar catálogo
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Edita cursos, contenido y estado de publicación.</p>
        </Link>
        <Link href="/admin/users" className="rounded-xl border border-border/70 bg-card px-4 py-3 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="size-4 text-primary" /> Gestionar usuarios
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Administra roles, accesos y activaciones.</p>
        </Link>
        <Link href="/admin/students" className="rounded-xl border border-border/70 bg-card px-4 py-3 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="size-4 text-primary" /> Comunidad estudiantil
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Revisa actividad y progreso de alumnos.</p>
        </Link>
      </div>
    </div>
  );
}
