import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RequestResetForm } from "@/components/auth/RequestResetForm";

export const metadata = {
  title: "Recuperar contraseña — RIVISIG Consultores",
};

export default async function RecuperarPage() {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/student");
  }

  return <RequestResetForm />;
}
