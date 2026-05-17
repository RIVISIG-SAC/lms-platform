import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle, ChevronLeft, LifeBuoy } from "lucide-react";
import { EmptyState } from "@/components/admin/EmptyState";

export const metadata = { title: "FAQ y ayuda | Estudiante" };

export default async function StudentFaqPage() {
  const faqs = await prisma.systemFaq.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
    },
  });

  const grouped = faqs.reduce<Record<string, typeof faqs>>((acc, faq) => {
    const key = faq.category?.trim() || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(faq);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort((a, b) => {
    if (a === "General") return -1;
    if (b === "General") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
      >
        <ChevronLeft className="size-3.5" /> Volver al panel
      </Link>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
            <HelpCircle className="size-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Soporte</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-1">
              Preguntas frecuentes
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Resuelve las dudas más comunes sobre tu cuenta, cursos, certificados y pagos. ¿No encuentras
              lo que buscas? Escríbenos desde el botón <strong>Contactar tutor</strong> del panel.
            </p>
          </div>
        </div>
      </div>

      {faqs.length === 0 ? (
        <EmptyState
          icon={LifeBuoy}
          title="Aún no hay preguntas frecuentes"
          description="Estamos preparando contenido de ayuda. Mientras tanto, puedes contactarnos directamente desde tu panel."
        />
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category} className="border border-border shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  {category}
                </h2>
                <Accordion className="space-y-3">
                  {grouped[category].map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="border border-border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md data-panel-open:border-primary/25 data-panel-open:shadow-md not-last:border-b"
                    >
                      <AccordionTrigger className="px-4 py-4 hover:no-underline">
                        <span className="font-semibold text-foreground text-sm pr-3">
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-1">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
