"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlayCircle } from "lucide-react";
import type { CourseDetail } from "./types";

type Props = {
  modules: CourseDetail["modules"];
};

export function CourseCurriculum({ modules }: Props) {
  const allIds = modules.map((m) => m.id);
  const [value, setValue] = useState<string[]>(allIds.slice(0, 1));

  const allOpen = value.length === allIds.length;

  function toggleAll() {
    setValue(allOpen ? [] : allIds);
  }

  const totalChapters = modules.reduce((acc, m) => acc + m.chapters.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Contenido del curso</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {modules.length} módulo{modules.length !== 1 ? "s" : ""} · {totalChapters} clase{totalChapters !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          {allOpen ? "Colapsar todo" : "Expandir todo"}
        </button>
      </div>

      <Accordion
        multiple
        value={value}
        onValueChange={(v) => setValue(v as string[])}
        className="space-y-3"
      >
        {modules.map((mod, idx) => (
          <AccordionItem
            key={mod.id}
            value={mod.id}
            className="border border-border rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300 hover:shadow-md data-panel-open:border-primary/25 data-panel-open:shadow-md not-last:border-b"
          >
            <AccordionTrigger className="px-4 py-4 hover:no-underline data-panel-open:bg-muted/40">
              <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                <span className="inline-flex shrink-0 size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {idx + 1}
                </span>
                <div className="min-w-0 text-left">
                  <p className="font-semibold text-foreground text-sm truncate">{mod.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {mod.chapters.length} clase{mod.chapters.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              <ul className="divide-y divide-border border-t border-border -mx-4 px-4">
                {mod.chapters.map((ch) => (
                  <li
                    key={ch.id}
                    className="py-2.5 text-sm text-foreground/80 flex items-center gap-2.5"
                  >
                    <PlayCircle className="size-4 text-primary/60 shrink-0" />
                    <span className="truncate">{ch.title}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
