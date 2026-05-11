"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarContext } from "./MobileShell";

export function HamburgerButton() {
  const { setIsOpen } = useSidebarContext();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      onClick={() => setIsOpen(true)}
      aria-label="Abrir menú de navegación"
    >
      <Menu className="size-5" />
    </Button>
  );
}
