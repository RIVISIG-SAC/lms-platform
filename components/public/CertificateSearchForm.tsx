"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Deja el código en el formato XXXX-XXXX-XXXX mientras se escribe. */
function normalizar(valor: string) {
  const limpio = valor
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 12);
  return limpio.replace(/(.{4})(?=.)/g, "$1-");
}

export function CertificateSearchForm({
  defaultValue = "",
  autoFocus = false,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [code, setCode] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  const listo = code.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = code.trim();
        if (!trimmed) return;
        setLoading(true);
        router.push(`/verificar/${encodeURIComponent(trimmed)}`);
      }}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          value={code}
          onChange={(e) => setCode(normalizar(e.target.value))}
          placeholder="ABCD-EFGH-IJKL"
          aria-label="Código de verificación"
          className="h-12 rounded-xl border-border bg-background pl-10 font-mono text-sm tracking-widest uppercase placeholder:tracking-widest focus-visible:border-primary focus-visible:ring-primary/25"
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
        />
      </div>
      <Button
        type="submit"
        disabled={loading || !listo}
        className="h-12 shrink-0 justify-center gap-2 px-6 text-sm font-bold"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <Search className="size-4" />
            Verificar
          </>
        )}
      </Button>
    </form>
  );
}
