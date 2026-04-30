"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateInstructorProfileAction } from "@/app/actions/instructor";

type Props = {
  userId: string;
  bio?: string | null;
  avatarUrl?: string | null;
  title?: string | null;
  specialization?: string | null;
  linkedin?: string | null;
  website?: string | null;
};

export function InstructorProfileForm({
  userId,
  bio,
  avatarUrl,
  title,
  specialization,
  linkedin,
  website,
}: Props) {
  const [state, action, pending] = useActionState(updateInstructorProfileAction, null);

  useEffect(() => {
    if (state?.success) toast.success("Perfil actualizado correctamente");
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="userId" value={userId} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Título / Cargo</Label>
          <Input id="title" name="title" defaultValue={title ?? ""} placeholder="Ej: Lead ISO Auditor" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="specialization">Especialización</Label>
          <Input id="specialization" name="specialization" defaultValue={specialization ?? ""} placeholder="Ej: Gestión de calidad ISO 9001" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="avatarUrl">URL de foto de perfil</Label>
          <Input id="avatarUrl" name="avatarUrl" type="url" defaultValue={avatarUrl ?? ""} placeholder="https://..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input id="linkedin" name="linkedin" type="url" defaultValue={linkedin ?? ""} placeholder="https://linkedin.com/in/..." />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="website">Sitio web</Label>
          <Input id="website" name="website" type="url" defaultValue={website ?? ""} placeholder="https://..." />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="bio">Biografía / Presentación</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={bio ?? ""}
            rows={5}
            placeholder="Describe tu experiencia, certificaciones y metodología de enseñanza..."
          />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
