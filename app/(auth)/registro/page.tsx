import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Crear cuenta — RIVISIG Consultores",
};

export default async function RegistroPage(props: { searchParams: Promise<unknown> }) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "ADMIN" ? "/admin" : "/student");
  }

  const sp = (await props.searchParams) as Record<string, string | undefined>;
  const next = sp.next ?? undefined;

  return <RegisterForm next={next} />;
}
