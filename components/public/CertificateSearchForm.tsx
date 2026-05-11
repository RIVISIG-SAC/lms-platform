"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CertificateSearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = code.trim();
        if (!trimmed) return;
        setLoading(true);
        router.push(`/verificar/${encodeURIComponent(trimmed)}`);
      }}
      className="flex gap-2 w-full"
    >
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Ej. ABCD-EFGH-IJKL"
        className="h-12 font-mono text-sm tracking-widest bg-white border-border/60 focus-visible:ring-primary/30 text-secondary-foreground"
        autoComplete="off"
        spellCheck={false}
      />
      <Button
        type="submit"
        disabled={loading || !code.trim()}
        className="h-12 px-6 shrink-0 gap-2"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Search className="size-4" />
        )}
        Verificar
      </Button>
    </form>
  );
}
