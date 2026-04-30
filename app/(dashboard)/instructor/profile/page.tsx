import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { InstructorProfileForm } from "@/components/profile/InstructorProfileForm";
import { UserCircle } from "lucide-react";

export const metadata = { title: "Mi Perfil | Instructor" };

export default async function InstructorProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "INSTRUCTOR") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { instructorProfile: true },
  });
  if (!user) redirect("/login");

  const profile = user.instructorProfile;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Breadcrumb>
        <BreadcrumbList className="text-xs font-semibold uppercase tracking-widest">
          <BreadcrumbItem>
            <BreadcrumbLink href="/instructor" className="normal-case tracking-normal font-medium">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="normal-case tracking-normal font-medium">
              Mi Perfil
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 shrink-0">
          <UserCircle className="size-5 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Esta información aparecerá en los cursos y en tu página pública.
          </p>
        </div>
        {profile && (
          <Link
            href={`/instructores/${profile.id}`}
            className="text-xs text-primary underline shrink-0"
            target="_blank"
          >
            Ver página pública →
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Información de cuenta
          </h2>
          <ProfileForm name={user.name} email={user.email} />
        </div>
        <div className="border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Seguridad
          </h2>
          <ChangePasswordForm />
        </div>
        <div className="border-t border-border pt-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Perfil profesional
          </h2>
          <InstructorProfileForm
            userId={user.id}
            bio={profile?.bio}
            avatarUrl={profile?.avatarUrl}
            title={profile?.title}
            specialization={profile?.specialization}
            linkedin={profile?.linkedin}
            website={profile?.website}
          />
        </div>
      </div>
    </div>
  );
}
