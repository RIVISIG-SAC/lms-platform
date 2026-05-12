import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export async function NavAuthButtons() {
  const session = await getSession();

  if (session) {
    return (
      <Link
        href={session.role === 'ADMIN' ? '/admin' : '/student'}
        className={cn(buttonVariants({ size: 'sm' }))}
      >
        Mi Panel
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
      >
        Iniciar sesión
      </Link>
      <Link href="/registro" className={cn(buttonVariants({ size: 'sm' }))}>
        Registrarse
      </Link>
    </>
  );
}

export function NavAuthSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
      <div className="h-8 w-24 rounded-md bg-primary/20 animate-pulse" />
    </div>
  );
}
