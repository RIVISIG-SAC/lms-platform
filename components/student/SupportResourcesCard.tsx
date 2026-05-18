"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactTutorDialog } from "./ContactTutorDialog";

type Props = {
  userEmail: string;
  userName: string;
};

export function SupportResourcesCard({ userEmail, userName }: Props) {
  return (
    <Card className="border border-border shadow-sm bg-card">
      <CardHeader className="pb-3 px-6">
        <CardTitle className="text-base font-bold">Soporte y Recursos</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-2">
        <Link
          href="/student/guia"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors group"
        >
          <span className="text-sm font-medium">Guía del estudiante</span>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
        </Link>
        <Link
          href="/student/faq"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors group"
        >
          <span className="text-sm font-medium">FAQ y Ayuda</span>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
        </Link>
        <ContactTutorDialog
          userEmail={userEmail}
          userName={userName}
          trigger={
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors group text-left"
            >
              <span className="text-sm font-medium">Contactar tutor</span>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
            </button>
          }
        />
      </CardContent>
    </Card>
  );
}
