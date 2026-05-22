import { HamburgerButton } from "./HamburgerButton";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

type HeaderProps = {
  userName: string;
  userEmail: string;
  role: "ADMIN" | "STUDENT" | "INSTRUCTOR";
};

export function Header({ userName, userEmail, role }: HeaderProps) {
  const showBell = role === "ADMIN" || role === "STUDENT";

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-4">
        <HamburgerButton />
      </div>

      <div className="flex items-center gap-2">
        {showBell && <NotificationBell />}
        <UserMenu userName={userName} userEmail={userEmail} role={role} />
      </div>
    </header>
  );
}
