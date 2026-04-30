"use client";

import { useTransition } from "react";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { issueCertificateAction } from "@/app/actions/certificates";

type Props = {
  enrollmentId: string;
};

export function IssueCertificateButton({ enrollmentId }: Props) {
  const [pending, startTransition] = useTransition();

  function handleIssue() {
    startTransition(async () => {
      const result = await issueCertificateAction(enrollmentId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Certificado emitido correctamente");
      }
    });
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleIssue}
      disabled={pending}
      className="gap-1.5 text-xs"
    >
      <Award className="size-3.5" />
      {pending ? "Emitiendo..." : "Emitir certificado"}
    </Button>
  );
}
