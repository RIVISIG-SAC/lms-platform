"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  Copy,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  KeyRound,
  Loader2,
  Presentation,
  RefreshCw,
  ShieldCheck,
  UserCog,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { createUserAction } from "@/app/actions/users";
import { cn } from "@/lib/utils";

type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

const ROLES: {
  value: Role;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  {
    value: "STUDENT",
    label: "Estudiante",
    description: "Se inscribe a cursos, rinde evaluaciones y obtiene certificados.",
    icon: GraduationCap,
  },
  {
    value: "INSTRUCTOR",
    label: "Instructor",
    description: "Dicta cursos y aparece con perfil público en la web.",
    icon: Presentation,
  },
  {
    value: "ADMIN",
    label: "Administrador",
    description: "Acceso total: usuarios, cursos, pagos y certificados.",
    icon: ShieldCheck,
  },
];

const LONGITUD_CLAVE = 14;

/** Contraseña temporal legible: sin caracteres que se confundan (0/O, 1/l/I). */
function generarPassword() {
  const grupos = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnpqrstuvwxyz",
    "23456789",
    "!@#$%&*",
  ];
  const todos = grupos.join("");
  const bytes = new Uint32Array(LONGITUD_CLAVE);
  crypto.getRandomValues(bytes);

  // Un carácter garantizado de cada grupo y el resto libre, luego se mezcla.
  const chars = grupos.map((g, i) => g[bytes[i] % g.length]);
  for (let i = grupos.length; i < LONGITUD_CLAVE; i++) {
    chars.push(todos[bytes[i] % todos.length]);
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = bytes[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

function Seccion({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start gap-3 border-b border-border pb-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function Campo({
  id,
  label,
  hint,
  className,
  children,
}: {
  id: string;
  label: React.ReactNode;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

const CONTROL =
  "h-11 rounded-xl border-border bg-background text-sm focus-visible:border-primary focus-visible:ring-primary/25";

export function CreateUserForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("STUDENT");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
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

  function nuevaPassword() {
    setPassword(generarPassword());
    setVisible(true);
    setCopiado(false);
  }

  async function copiarPassword() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopiado(true);
      toast.success("Contraseña copiada al portapapeles");
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      toast.error("No se pudo copiar. Selecciona el texto manualmente.");
    }
  }

  return (
    <form action={action} className="space-y-5">
      <Seccion
        icon={UserCog}
        title="Datos de la cuenta"
        description="La cuenta se crea verificada y activa: podrá iniciar sesión de inmediato."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Campo id="name" label="Nombre completo">
            <Input
              id="name"
              name="name"
              placeholder="Juan Pérez"
              autoComplete="off"
              required
              className={CONTROL}
            />
          </Campo>

          <Campo id="email" label="Correo electrónico">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="juan@ejemplo.com"
              autoComplete="off"
              required
              className={CONTROL}
            />
          </Campo>
        </div>
      </Seccion>

      <Seccion
        icon={KeyRound}
        title="Contraseña temporal"
        description="Compártela por un canal seguro. Caduca a los 90 días."
      >
        <div className="space-y-2">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={visible ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setCopiado(false);
              }}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              minLength={8}
              className={cn(
                CONTROL,
                "pr-24",
                visible && password && "font-mono tracking-tight",
              )}
            />
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {visible ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={copiarPassword}
                disabled={!password}
                aria-label="Copiar contraseña"
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-40"
              >
                {copiado ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={nuevaPassword}
            className="gap-1.5 font-semibold"
          >
            <RefreshCw className="size-3.5" />
            Generar contraseña segura
          </Button>
        </div>
      </Seccion>

      <Seccion
        icon={ShieldCheck}
        title="Rol y permisos"
        description="Define a qué puede acceder el usuario dentro de la plataforma."
      >
        {/* El valor viaja en el radio marcado; no hace falta input oculto. */}
        <fieldset className="grid gap-3 sm:grid-cols-3">
          <legend className="sr-only">Rol del usuario</legend>
          {ROLES.map(({ value, label, description, icon: Icon }) => {
            const activo = role === value;
            return (
              <label
                key={value}
                className={cn(
                  "relative flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-all",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/40",
                  activo
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border hover:border-primary/30 hover:bg-accent/40",
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={activo}
                  onChange={() => setRole(value)}
                  className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
                />
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-lg transition-colors",
                    activo
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    activo ? "text-primary" : "text-foreground",
                  )}
                >
                  {label}
                </span>
                <span className="text-[11px] leading-relaxed text-muted-foreground">
                  {description}
                </span>
              </label>
            );
          })}
        </fieldset>

        {role === "ADMIN" && (
          <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-800">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            Un administrador puede crear y eliminar usuarios, editar cursos y
            emitir certificados. Asígnalo solo si es estrictamente necesario.
          </p>
        )}
      </Seccion>

      {role === "INSTRUCTOR" && (
        <Seccion
          icon={Presentation}
          title="Perfil de instructor"
          description="Todos los campos son opcionales y se muestran en su página pública."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Campo id="title" label="Título o cargo">
              <Input
                id="title"
                name="title"
                placeholder="Ej. Ing. en Sistemas"
                className={CONTROL}
              />
            </Campo>

            <Campo id="specialization" label="Especialización">
              <Input
                id="specialization"
                name="specialization"
                placeholder="Ej. ISO 45001, auditoría interna"
                className={CONTROL}
              />
            </Campo>

            <Campo id="linkedin" label="LinkedIn">
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className={CONTROL}
              />
            </Campo>

            <Campo id="website" label="Sitio web">
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://..."
                className={CONTROL}
              />
            </Campo>

            <Campo
              id="avatarUrl"
              label="Foto de perfil"
              className="md:col-span-2"
              hint="JPG, PNG o WEBP hasta 5 MB. Se recomienda una foto cuadrada."
            >
              <input type="hidden" name="avatarUrl" value={avatarUrl} />
              <CloudinaryUpload
                value={avatarUrl}
                onChange={setAvatarUrl}
                resourceType="image"
                label="Subir foto"
                folder="lms/instructors"
                layout="row"
              />
            </Campo>

            <Campo id="bio" label="Biografía" className="md:col-span-2">
              <Textarea
                id="bio"
                name="bio"
                placeholder="Trayectoria, sectores en los que ha trabajado, certificaciones..."
                className="min-h-28 resize-none rounded-xl border-border bg-background text-sm focus-visible:border-primary focus-visible:ring-primary/25"
              />
            </Campo>
          </div>
        </Seccion>
      )}

      {state?.error && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-px size-3.5 shrink-0" />
          El usuario deberá cambiar la contraseña temporal desde su perfil.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="min-h-11 justify-center font-semibold sm:min-h-10"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="min-h-11 justify-center gap-2 font-semibold sm:min-h-10"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                Crear usuario
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
