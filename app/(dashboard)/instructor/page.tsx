import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { BookOpen, UserCircle } from "lucide-react";

export const metadata = { title: "Dashboard | Instructor" };

export default async function InstructorDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "INSTRUCTOR") redirect("/login");

  const profile = await prisma.instructorProfile.findUnique({
    where: { userId: session.userId },
    include: {
      courses: {
        where: { published: true },
        select: { id: true, title: true, thumbnailUrl: true, _count: { select: { enrollments: true } } },
      },
    },
  });

  const courses = profile?.courses ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
          <UserCircle className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bienvenido, {session.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Panel de instructor — gestiona tu perfil y consulta tus cursos.
          </p>
        </div>
        <Button render={<Link href="/instructor/profile" />} variant="outline" size="sm" className="shrink-0 gap-2">
          <UserCircle className="size-4" />
          Editar perfil
        </Button>
      </div>

      {/* Courses assigned */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-2">
          <BookOpen className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            Mis cursos ({courses.length})
          </h2>
        </div>
        {courses.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground text-center">
            Aún no tienes cursos asignados. El administrador te asignará cursos desde el panel.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {courses.map((course) => (
              <div key={course.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{course.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {course._count.enrollments} estudiante{course._count.enrollments !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
