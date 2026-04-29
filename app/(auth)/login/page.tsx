import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Iniciar Sesión — RIVISIG Consultores",
};

export default async function LoginPage(props: { searchParams: Promise<unknown> }) {
  const sp = (await props.searchParams) as Record<string, string | undefined>;
  const next = sp.next ?? undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bienvenido de vuelta</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ingresa tus credenciales para acceder a la plataforma
        </p>
      </div>

      <LoginForm next={next} />

      <div className="relative flex items-center">
        <Separator className="flex-1" />
        <span className="px-3 text-xs text-muted-foreground shrink-0">
          ¿Nuevo en la plataforma?
        </span>
        <Separator className="flex-1" />
      </div>

      <div className="text-center">
        <Link
          href={next ? `/registro?next=${encodeURIComponent(next)}` : "/registro"}
          className="text-sm text-primary hover:underline font-medium"
        >
          Crea tu cuenta gratis
        </Link>
      </div>
    </div>
  );
}
