import Link from "next/link";
import { CourseForm } from "@/components/admin/CourseForm";
import { createCourse } from "@/app/actions/courses";
import { BookOpen, Info, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata = { title: "Nuevo Curso | Admin" };

export default function NewCoursePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin/courses" />}>Cursos</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Nuevo curso
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
          <PlusCircle className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Nuevo curso
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea primero la información básica. Tras guardar, podrás añadir módulos, capítulos y la evaluación final.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4 flex gap-3">
        <Info className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="text-sm text-foreground/80">
          <p className="font-semibold text-foreground">Flujo recomendado</p>
          <ol className="mt-1.5 space-y-0.5 text-xs text-muted-foreground list-decimal ml-4">
            <li>Completa la información básica (título, descripción, categoría, nivel y precio).</li>
            <li>Al guardar, entrarás al editor del curso y podrás crear módulos y capítulos.</li>
            <li>Finalmente, añade preguntas de evaluación y publica cuando el curso esté listo.</li>
          </ol>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border/60">
            <BookOpen className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Información del curso
            </h2>
          </div>
          <CourseForm action={createCourse} />
        </CardContent>
      </Card>
    </div>
  );
}
