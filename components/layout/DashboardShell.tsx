import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type DashboardShellProps = {
  role: "ADMIN" | "STUDENT" | "INSTRUCTOR";
  userName: string;
  userEmail: string;
  children: React.ReactNode;
};

export function DashboardShell({
  role,
  userName,
  userEmail,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-0 focus:left-0 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-br-md"
      >
        Ir al contenido principal
      </a>
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={userName} userEmail={userEmail} role={role}/>
        <main id="main-content" className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
