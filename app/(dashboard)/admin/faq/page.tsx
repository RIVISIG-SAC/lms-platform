import { prisma } from "@/lib/prisma";
import { SystemFaqManager } from "@/components/admin/SystemFaqManager";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { HelpCircle } from "lucide-react";

export const metadata = { title: "FAQ Global | Admin" };

export default async function AdminFaqPage() {
  const faqs = await prisma.systemFaq.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
      order: true,
      published: true,
    },
  });

  const publishedCount = faqs.filter((f) => f.published).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">FAQ Global</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4 min-w-0">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
            <HelpCircle className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Preguntas frecuentes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {faqs.length} {faqs.length === 1 ? "pregunta" : "preguntas"} · {publishedCount} visible
              {publishedCount === 1 ? "" : "s"} para los estudiantes
            </p>
          </div>
        </div>
      </div>

      <SystemFaqManager faqs={faqs} />
    </div>
  );
}
