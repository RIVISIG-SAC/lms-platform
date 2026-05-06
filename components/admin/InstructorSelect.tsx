"use client";

import { useState } from "react";
import { User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type InstructorOption = {
  id: string;
  user: { name: string };
  title: string | null;
};

type Props = {
  instructors: InstructorOption[];
  defaultValue?: string | null;
};

export function InstructorSelect({ instructors, defaultValue }: Props) {
  const [value, setValue] = useState<string>(defaultValue ?? "none");
  const selectedInstructor = instructors.find((instructor) => instructor.id === value);
  const controlClassName = "h-12 w-full rounded-xl border-border/80 bg-background text-[15px]";

  return (
    <div className="space-y-2">
      <Label htmlFor="instructorId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <User className="size-3.5" /> Instructor / Tutor
      </Label>
      <input type="hidden" name="instructorId" value={value === "none" ? "" : value} />
      <Select value={value} onValueChange={(v) => setValue(v ?? "none")}>
        <SelectTrigger id="instructorId" className={controlClassName}>
          <SelectValue placeholder="Sin instructor asignado">
            {() =>
              value === "none"
                ? "Sin instructor asignado"
                : selectedInstructor
                  ? `${selectedInstructor.user.name}${selectedInstructor.title ? ` — ${selectedInstructor.title}` : ""}`
                  : "Instructor no disponible"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Sin instructor asignado</SelectItem>
          {instructors.map((instructor) => (
            <SelectItem key={instructor.id} value={instructor.id}>
              {instructor.user.name}
              {instructor.title ? ` — ${instructor.title}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
