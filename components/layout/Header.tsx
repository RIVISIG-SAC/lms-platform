import { deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  userName: string;
  userEmail: string;
  role: "ADMIN" | "STUDENT";
};

async function logout() {
  "use server";
  await deleteSession();
  redirect("/login");
}

export function Header({ userName, userEmail, role }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        {/* Placeholder for breadcrumbs or page title if needed */}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 pr-4 border-r border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-foreground leading-none mb-1">
              {userName}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {role}
            </p>
          </div>
          <div className="size-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground border border-border">
            <User className="size-5" aria-hidden="true" />
          </div>
        </div>

        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            aria-label="Cerrar sesión"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 font-semibold"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden md:inline" aria-hidden="true">Cerrar sesión</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
