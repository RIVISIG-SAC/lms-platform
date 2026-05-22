"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  setIsOpen: () => {},
});

export function useSidebarContext() {
  return useContext(SidebarContext);
}

type MobileShellProps = {
  sidebarContent: React.ReactNode;
  children: React.ReactNode;
};

export function MobileShell({ sidebarContent, children }: MobileShellProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="flex min-h-screen">
        {/* Overlay backdrop — mobile only */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar wrapper — fixed drawer on mobile, sticky on desktop */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 shrink-0 transition-transform duration-300 ease-in-out",
            "md:sticky md:inset-y-auto md:top-0 md:h-screen md:z-auto md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </div>

        {/* Right column: header + main */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
