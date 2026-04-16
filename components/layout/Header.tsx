import { deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";

type HeaderProps = {
  userName: string;
  userEmail: string;
};

async function logout() {
  "use server";
  await deleteSession();
  redirect("/login");
}

export function Header({ userName, userEmail }: HeaderProps) {
  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-[var(--card-foreground)]">
            {userName}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">{userEmail}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors px-3 py-1.5 rounded border border-[var(--border)] hover:border-[var(--destructive)]"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}
