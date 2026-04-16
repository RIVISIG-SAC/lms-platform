import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type DashboardShellProps = {
  role: "ADMIN" | "STUDENT";
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
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={userName} userEmail={userEmail} />
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--background)]">
          {children}
        </main>
      </div>
    </div>
  );
}
