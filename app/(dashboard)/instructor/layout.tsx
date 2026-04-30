import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "INSTRUCTOR") redirect("/login");

  return <>{children}</>;
}
