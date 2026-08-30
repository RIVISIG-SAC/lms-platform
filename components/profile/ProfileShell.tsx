import Link from 'next/link';
import {
  BadgeCheck,
  CircleAlert,
  ExternalLink,
  GraduationCap,
  Presentation,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn, formatDate } from '@/lib/utils';

export type ProfileRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

const ROLES: Record<ProfileRole, { label: string; icon: LucideIcon }> = {
  ADMIN: { label: 'Administrador', icon: ShieldCheck },
  INSTRUCTOR: { label: 'Instructor', icon: Presentation },
  STUDENT: { label: 'Estudiante', icon: GraduationCap },
};

const DIAS_AVISO_PASSWORD = 15;

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Tarjeta contenedora de cada bloque de formulario del perfil. */
export function ProfileSection({
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

function Dato({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'amber' | 'muted';
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <dt className="shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'min-w-0 truncate text-right text-xs font-semibold',
          tone === 'amber' && 'text-amber-700',
          tone === 'muted' && 'text-muted-foreground',
          (!tone || tone === 'default') && 'text-foreground',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

type Props = {
  role: ProfileRole;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  passwordExpiresAt: Date;
  avatarUrl?: string | null;
  /** Enlace a la página pública del perfil (solo instructores). */
  publicHref?: string | null;
  description: string;
  children: React.ReactNode;
};

export function ProfileShell({
  role,
  name,
  email,
  emailVerified,
  createdAt,
  lastLoginAt,
  passwordExpiresAt,
  avatarUrl,
  publicHref,
  description,
  children,
}: Props) {
  const rol = ROLES[role];
  const RolIcon = rol.icon;

  const diasPassword = Math.ceil(
    (passwordExpiresAt.getTime() - Date.now()) / 86_400_000,
  );
  const passwordPorVencer = diasPassword <= DIAS_AVISO_PASSWORD;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Cuenta
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            Mi perfil
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
        {publicHref && (
          <Link
            href={publicHref}
            target="_blank"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'w-full justify-center gap-2 font-semibold md:w-auto',
            )}
          >
            <ExternalLink className="size-4" />
            Ver página pública
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[19rem_1fr] lg:gap-8">
        {/* Identidad y datos de cuenta */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name}
                className="mx-auto size-20 rounded-2xl border border-border object-cover"
              />
            ) : (
              <span className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-black text-primary">
                {iniciales(name)}
              </span>
            )}

            <h2 className="mt-4 text-base font-bold leading-snug text-foreground">
              {name}
            </h2>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {email}
            </p>

            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
              <RolIcon className="size-3.5" />
              {rol.label}
            </span>
          </div>

          <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            <Dato label="Miembro desde" value={formatDate(createdAt)} />
            <Dato
              label="Último acceso"
              value={lastLoginAt ? formatDate(lastLoginAt) : 'Sin registro'}
              tone={lastLoginAt ? 'default' : 'muted'}
            />
            <Dato
              label="Correo"
              value={
                emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <BadgeCheck className="size-3.5" />
                    Verificado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <CircleAlert className="size-3.5" />
                    Sin verificar
                  </span>
                )
              }
            />
            <Dato
              label="Contraseña vence"
              value={formatDate(passwordExpiresAt)}
              tone={passwordPorVencer ? 'amber' : 'default'}
            />
          </dl>
        </aside>

        {/* Formularios */}
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
}

/** Texto de apoyo para la sección de seguridad, según la caducidad de la clave. */
export function textoSeguridad(passwordExpiresAt: Date) {
  const dias = Math.ceil(
    (passwordExpiresAt.getTime() - Date.now()) / 86_400_000,
  );
  if (dias <= 0) return 'Tu contraseña ha caducado. Actualízala para seguir usando la plataforma.';
  if (dias <= DIAS_AVISO_PASSWORD)
    return `Tu contraseña caduca en ${dias} ${dias === 1 ? 'día' : 'días'}. Cámbiala para no perder el acceso.`;
  return 'Usa al menos 8 caracteres y no reutilices contraseñas de otros servicios.';
}
