import { prisma } from "@/lib/prisma";
import { getRequiredSession } from "@/lib/auth";
import { CourseCard } from "@/components/courses/CourseCard";
import { Search, Library, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Catálogo de Cursos | Cursos Pro" };

export default async function StudentCatalogPage() {
  const session = await getRequiredSession();

  const [courses, enrollments] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { modules: true } } },
    }),
    prisma.enrollment.findMany({
      where: { userId: session.userId },
      select: { courseId: true, status: true },
    }),
  ]);

  const enrolledMap = new Map(enrollments.map((e) => [e.courseId, e.status]));

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Catalog Header */}
      <div className="bg-card/40 p-8 rounded-3xl border border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
            <Library className="size-4" />
            <span>Biblioteca de Aprendizaje</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Catálogo de Cursos
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Descubre {courses.length} {courses.length === 1 ? "curso diseñado" : "cursos diseñados"} para potenciar tu carrera profesional.
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="¿Qué quieres aprender hoy?"
            className="h-12 w-full md:w-80 rounded-2xl border border-border bg-background/50 px-10 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            disabled
          />
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-border/60 rounded-3xl bg-accent/5">
          <Sparkles className="size-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-bold">
            Estamos preparando nuevos cursos para ti.
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">Vuelve pronto para ver las novedades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const enrollStatus = enrolledMap.get(course.id);
            const isActive = enrollStatus === "PAID" || enrollStatus === "COMPLETED";

            return (
              <div key={course.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CourseCard
                  id={course.id}
                  title={course.title}
                  description={course.description}
                  price={course.price}
                  thumbnailUrl={course.thumbnailUrl}
                  moduleCount={course._count.modules}
                  href={`/student/catalog/${course.id}`}
                  badge={
                    isActive ? (
                      <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600 text-white border-white/20 px-3 py-1 font-bold gap-1.5 shadow-lg">
                        <CheckCircle2 className="size-3.5" /> Inscrito
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-foreground border-none px-3 py-1 font-bold shadow-sm">
                        Nuevo
                      </Badge>
                    )
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
