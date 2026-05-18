"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { CourseDetail } from "./types";

type Props = {
  faqs: CourseDetail["faqs"];
};

export function CourseFaqSection({ faqs }: Props) {
  if (faqs.length === 0) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Preguntas frecuentes</h2>
      <p className="text-sm text-muted-foreground mb-5">
        Resuelve tus dudas antes de inscribirte.
      </p>
      <Accordion className="space-y-3">
        {faqs.map((faq) => (
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
    </div>
  );
}
