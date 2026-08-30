import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { InstructorProfileForm } from '@/components/profile/InstructorProfileForm';
import {
  ProfileShell,
  ProfileSection,
  textoSeguridad,
} from '@/components/profile/ProfileShell';
import { BookUser, KeyRound, UserCircle } from 'lucide-react';

export const metadata = { title: 'Mi Perfil | Instructor' };

export default async function InstructorProfilePage() {
  const session = await getSession();
  if (!session || session.role !== 'INSTRUCTOR') redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { instructorProfile: true },
  });
  if (!user) redirect('/login');

  const profile = user.instructorProfile;

  return (
    <ProfileShell
      role="INSTRUCTOR"
      name={user.name}
      email={user.email}
      emailVerified={user.emailVerified}
      createdAt={user.createdAt}
      lastLoginAt={user.lastLoginAt}
      passwordExpiresAt={user.passwordExpiresAt}
      avatarUrl={profile?.avatarUrl}
      publicHref={profile ? `/instructores/${profile.id}` : null}
      description="Tus datos de cuenta y la información que aparece en tus cursos y en tu página pública."
    >
      <ProfileSection
        icon={UserCircle}
        title="Información de cuenta"
        description="Estos datos identifican tu cuenta dentro de la plataforma."
      >
        <ProfileForm
          name={user.name}
          email={user.email}
          dni={user.dni}
          company={user.company}
        />
      </ProfileSection>

      <ProfileSection
        icon={BookUser}
        title="Perfil profesional"
        description="Esta información es pública: aparece en los cursos que dictas y en tu página de instructor."
      >
        <InstructorProfileForm
          userId={user.id}
          bio={profile?.bio}
          avatarUrl={profile?.avatarUrl}
          title={profile?.title}
          specialization={profile?.specialization}
          linkedin={profile?.linkedin}
          website={profile?.website}
        />
      </ProfileSection>

      <ProfileSection
        icon={KeyRound}
        title="Seguridad"
        description={textoSeguridad(user.passwordExpiresAt)}
      >
        <ChangePasswordForm />
      </ProfileSection>
    </ProfileShell>
  );
}
