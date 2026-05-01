import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Iniciar Sesión — RIVISIG Consultores",
};

export default async function LoginPage(props: { searchParams: Promise<unknown> }) {
  const sp = (await props.searchParams) as Record<string, string | undefined>;
  const next = sp.next ?? undefined;

  return <LoginForm next={next} />;
}
