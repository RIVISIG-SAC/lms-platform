import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/lib/auth';
import {
  Award,
  BookOpen,
  CalendarX,
  Clock,
  Download,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn, formatDate, getCertificateEffectiveStatus } from '@/lib/utils';

export const metadata = { title: 'Mis Certificados | Estudiante' };

const TONOS = {
  primary: 'bg-primary/10 text-primary',
  amber: 'bg-amber-50 text-amber-700',
  destructive: 'bg-destructive/10 text-destructive',
  muted: 'bg-muted text-muted-foreground',
} as const;

type Tono = keyof typeof TONOS;

function Fila({
  icon: Icon,
  tono,
  title,
  desc,
  action,
  atenuado,
}: {
  icon: typeof Award;
  tono: Tono;
  title: string;
  desc: string;
  action?: React.ReactNode;
  atenuado?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-4 sm:px-5',
        atenuado && 'opacity-70',
      )}
    >
      <span
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-lg',
          TONOS[tono],
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {title}
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

function TituloSeccion({
  icon: Icon,
  children,
}: {
  icon: typeof Award;
  children: React.ReactNode;
}) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
      <Icon className="size-3.5" />
      {children}
    </h2>
  );
}

export default async function StudentCertificatesPage() {
  const session = await getRequiredSession();

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.userId, status: { not: 'PENDING' } },
    orderBy: { startDate: 'desc' },
    include: {
      course: { select: { id: true, title: true, thumbnailUrl: true } },
      certificate: {
        select: {
          verificationCode: true,
          status: true,
          issueDate: true,
          expiresAt: true,
        },
      },
    },
  });

  const disponibles = enrollments.filter(
    (e) =>
      e.certificate &&
      getCertificateEffectiveStatus(
        e.certificate.status,
        e.certificate.expiresAt,
      ) === 'ACTIVE',
  );
  const vencidos = enrollments.filter(
    (e) =>
      e.certificate &&
      getCertificateEffectiveStatus(
        e.certificate.status,
        e.certificate.expiresAt,
      ) === 'EXPIRED',
  );
  const porPagar = enrollments.filter(
    (e) => e.certificate?.status === 'PENDING_PAYMENT',
  );
  const enProceso = enrollments.filter(
    (e) => !e.certificate && ['PAID', 'COMPLETED'].includes(e.status),
  );
  const noDisponibles = enrollments.filter(
    (e) => !e.certificate && !['PAID', 'COMPLETED'].includes(e.status),
  );

  const stats = [
    { icon: Award, label: 'Disponibles', value: disponibles.length },
    { icon: Clock, label: 'En proceso', value: enProceso.length + porPagar.length },
    { icon: CalendarX, label: 'Vencidos', value: vencidos.length },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Certificados
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
            Mis certificados
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Descarga tus certificados emitidos y consulta el estado de los que
            aún están en proceso.
          </p>
        </div>
        <Link
          href="/verificar"
          target="_blank"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-full justify-center gap-2 font-semibold md:w-auto',
          )}
        >
          <ShieldCheck className="size-4" />
          Verificar un certificado
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center sm:p-14">
          <span className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Award className="size-6" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-foreground">
            Aún no tienes inscripciones
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Cuando completes un curso y apruebes su evaluación, tu certificado
            aparecerá aquí.
          </p>
          <Link
            href="/student/catalog"
            className={cn(buttonVariants(), 'mt-6 justify-center font-bold')}
          >
            Explorar cursos
          </Link>
        </div>
      ) : (
        <>
          {/* Métricas */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-border bg-card p-4 sm:p-5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                </div>
                <p className="mt-3 text-3xl font-black tabular-nums tracking-tight text-foreground">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Certificados disponibles */}
          {disponibles.length > 0 && (
            <section>
              <TituloSeccion icon={Award}>
                Certificados disponibles
              </TituloSeccion>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {disponibles.map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start gap-4">
                      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Award className="size-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold leading-snug text-foreground">
                          {e.course.title}
                        </h3>
                        <div className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                          {e.certificate?.issueDate && (
                            <p>Emitido el {formatDate(e.certificate.issueDate)}</p>
                          )}
                          {e.certificate?.expiresAt ? (
                            <p>Válido hasta {formatDate(e.certificate.expiresAt)}</p>
                          ) : (
                            <p className="font-medium text-emerald-700">
                              Sin fecha de vencimiento
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                      <span className="min-w-0 truncate font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                        {e.certificate!.verificationCode}
                      </span>
                      <a
                        href={`/api/certificates/${e.certificate!.verificationCode}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'shrink-0 gap-2 font-semibold',
                        )}
                      >
                        <Download className="size-3.5" />
                        Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pago pendiente */}
          {porPagar.length > 0 && (
            <section>
              <TituloSeccion icon={Clock}>
                Pago de certificado pendiente
              </TituloSeccion>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {porPagar.map((e) => (
                  <Fila
                    key={e.id}
                    icon={Award}
                    tono="amber"
                    title={e.course.title}
                    desc="Completa el pago del certificado para poder descargarlo."
                    action={
                      <Link
                        href={`/student/courses/${e.course.id}/exam`}
                        className={cn(
                          buttonVariants({ size: 'sm' }),
                          'gap-2 font-semibold',
                        )}
                      >
                        Pagar
                      </Link>
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* En proceso de emisión */}
          {enProceso.length > 0 && (
            <section>
              <TituloSeccion icon={BookOpen}>En proceso de emisión</TituloSeccion>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {enProceso.map((e) => (
                  <Fila
                    key={e.id}
                    icon={BookOpen}
                    tono="muted"
                    title={e.course.title}
                    desc="Curso completado — el administrador debe emitir el certificado."
                    action={
                      <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        En proceso
                      </span>
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* Vencidos */}
          {vencidos.length > 0 && (
            <section>
              <TituloSeccion icon={CalendarX}>
                Certificados vencidos
              </TituloSeccion>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {vencidos.map((e) => (
                  <Fila
                    key={e.id}
                    icon={CalendarX}
                    tono="destructive"
                    atenuado
                    title={e.course.title}
                    desc={`Venció el ${formatDate(e.certificate!.expiresAt!)} — contacta al administrador si necesitas renovarlo.`}
                    action={
                      <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-destructive">
                        Vencido
                      </span>
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {/* No disponibles */}
          {noDisponibles.length > 0 && (
            <section>
              <TituloSeccion icon={Lock}>No disponibles</TituloSeccion>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {noDisponibles.map((e) => (
                  <Fila
                    key={e.id}
                    icon={Lock}
                    tono="muted"
                    atenuado
                    title={e.course.title}
                    desc="Completa y aprueba el curso para habilitar el certificado."
                    action={
                      <Link
                        href={`/student/courses/${e.course.id}`}
                        className={cn(
                          buttonVariants({ size: 'sm', variant: 'ghost' }),
                          'text-xs font-semibold',
                        )}
                      >
                        Ir al curso
                      </Link>
                    }
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
