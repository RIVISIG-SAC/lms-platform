"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserAction } from "@/app/actions/users";

const ROLE_LABELS: Record<string, string> = {
  STUDENT: "Estudiante",
  INSTRUCTOR: "Instructor",
  ADMIN: "Administrador",
};

export function CreateUserForm() {
  const router = useRouter();
  const [role, setRole] = useState("STUDENT");
  const [state, action, pending] = useActionState(createUserAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Usuario creado correctamente");
      router.push(`/admin/users/${state.userId}`);
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={action} className="space-y-6">
      {/* Base fields */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Datos de cuenta
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" name="name" placeholder="Juan Pérez" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña temporal</Label>
            <Input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" required minLength={8} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Rol</Label>
            {/* Hidden input so server action always receives role */}
            <input type="hidden" name="role" value={role} />
            <Select value={role} onValueChange={(v) => setRole(v ?? "STUDENT")}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Seleccionar rol">
                  {ROLE_LABELS[role]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Estudiante</SelectItem>
                <SelectItem value="INSTRUCTOR">Instructor</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Instructor profile fields */}
      {role === "INSTRUCTOR" && (
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Perfil de instructor (opcional)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Título / Cargo</Label>
              <Input id="title" name="title" placeholder="Ej. Ing. en Sistemas" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="specialization">Especialización</Label>
              <Input id="specialization" name="specialization" placeholder="Ej. Ciberseguridad, IA..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkedin">LinkedIn (URL)</Label>
              <Input id="linkedin" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website">Sitio web (URL)</Label>
              <Input id="website" name="website" type="url" placeholder="https://..." />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="avatarUrl">URL de foto de perfil</Label>
              <Input id="avatarUrl" name="avatarUrl" type="url" placeholder="https://..." />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Breve descripción del instructor..."
                className="resize-none min-h-25"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando..." : "Crear usuario"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
