import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CreateUserForm } from "@/components/admin/CreateUserForm";

export const metadata = { title: "Nuevo usuario | Admin" };

export default function NewUserPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-500">
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Usuarios
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">
          Alta de cuenta
        </p>
        <h1 className="mt-1.5 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Crear nuevo usuario
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Completa los datos y asigna un rol. El usuario podrá iniciar sesión con
          la contraseña temporal que definas aquí.
        </p>
      </div>

      <CreateUserForm />
    </div>
  );
}
