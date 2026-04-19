import { LandingCourseCard } from "@/components/landing/CourseCard";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Cursos — RIVISIG Consultores",
  description: "Capacitación certificada en sistemas de gestión ISO y cumplimiento normativo.",
};

export default async function CursosPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { modules: true } },
      modules: { include: { _count: { select: { chapters: true } } } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          Plataforma de capacitación
        </p>
        <h1 className="text-3xl font-bold text-foreground">Todos los cursos</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Contenido actualizado, evaluación incluida y certificado verificable.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          Próximamente nuevos cursos disponibles.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const chapterCount = course.modules.reduce(
              (acc, m) => acc + m._count.chapters,
              0
            );
            return (
              <LandingCourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                description={course.description}
                price={course.price}
                thumbnailUrl={course.thumbnailUrl}
                moduleCount={course._count.modules}
                chapterCount={chapterCount}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
