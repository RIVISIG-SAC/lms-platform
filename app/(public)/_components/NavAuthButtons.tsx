import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  /** `mobile` apila los botones a ancho completo dentro del menú desplegable. */
  layout?: 'desktop' | 'mobile';
};

export async function NavAuthButtons({ layout = 'desktop' }: Props) {
  const session = await getSession();
  const esMovil = layout === 'mobile';

  if (session) {
    return (
      <Link
        href={session.role === 'ADMIN' ? '/admin' : '/student'}
        className={cn(
          buttonVariants({ size: esMovil ? 'default' : 'sm' }),
          'gap-2 font-semibold',
          esMovil && 'min-h-11 w-full justify-center',
        )}
      >
        <LayoutDashboard className="size-4" aria-hidden="true" />
        Mi panel
      </Link>
    );
  }

  if (esMovil) {
    return (
      <div className="grid gap-2">
        <Link
          href="/registro"
          className={cn(
            buttonVariants(),
            'min-h-11 w-full justify-center font-semibold',
          )}
        >
          Registrarse
        </Link>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'min-h-11 w-full justify-center font-semibold',
          )}
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/registro"
        className={cn(buttonVariants({ size: 'sm' }), 'font-semibold')}
      >
        Registrarse
      </Link>
    </>
  );
}

export function NavAuthSkeleton({ layout = 'desktop' }: Props) {
  if (layout === 'mobile') {
    return (
      <div className="grid gap-2">
        <div className="h-11 w-full animate-pulse rounded-lg bg-primary/20" />
        <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      <div className="h-8 w-24 animate-pulse rounded-lg bg-primary/20" />
    </div>
  );
}
