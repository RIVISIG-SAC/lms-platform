import Link from "next/link";

/**
 * Aviso junto a cada botón de pago. La política declara que se acepta al
 * comprar, así que tiene que estar a la vista antes de abrir Culqi.
 */
export function RefundPolicyNotice() {
  return (
    <p className="text-xs text-center text-muted-foreground">
      Al comprar aceptas la{" "}
      <Link
        href="/politica-de-devoluciones"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-foreground"
      >
        Política de Reembolsos y Devoluciones
      </Link>
      .
    </p>
  );
}
