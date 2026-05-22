"use client";

import Link from "next/link";
import { ChevronDown, LogOut, User, UserCircle } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  STUDENT: "Estudiante",
  INSTRUCTOR: "Instructor",
};

const profileHrefByRole: Record<UserMenuProps["role"], string> = {
  ADMIN: "/admin/profile",
  STUDENT: "/student/profile",
  INSTRUCTOR: "/instructor/profile",
};

type UserMenuProps = {
  userName: string;
  userEmail: string;
  role: "ADMIN" | "STUDENT" | "INSTRUCTOR";
};

export function UserMenu({ userName, userEmail, role }: UserMenuProps) {
  const profileHref = profileHrefByRole[role];
  const label = roleLabel[role] ?? role;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-3 pr-2 pl-1 py-1 rounded-lg outline-none hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer data-popup-open:bg-accent/60"
        aria-label={`Menú de ${userName}`}
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-foreground leading-none mb-1">
            {userName}
          </p>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {label}
          </p>
        </div>
        <div className="size-9 rounded-full bg-accent flex items-center justify-center text-accent-foreground border border-border">
          <User className="size-5" aria-hidden="true" />
        </div>
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform duration-200 data-popup-open:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-2">
            <p className="text-sm font-semibold text-foreground truncate">
              {userEmail}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-0.5">
              {label}
            </p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href={profileHref} />} className="gap-2 px-2 py-2 cursor-pointer">
          <UserCircle className="size-4" aria-hidden="true" />
          Mi Perfil
        </DropdownMenuItem>

        <form action={logoutAction}>
          <DropdownMenuItem
            variant="destructive"
            render={<button type="submit" />}
            className="w-full gap-2 px-2 py-2 cursor-pointer"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Cerrar sesión
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
