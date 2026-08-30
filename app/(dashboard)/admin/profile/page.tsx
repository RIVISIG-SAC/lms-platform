import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import {
  ProfileShell,
  ProfileSection,
  textoSeguridad,
} from '@/components/profile/ProfileShell';
import { KeyRound, UserCircle } from 'lucide-react';

export const metadata = { title: 'Mi Perfil | Admin' };

export default async function AdminProfilePage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect('/login');

  return (
    <ProfileShell
      role="ADMIN"
      name={user.name}
      email={user.email}
      emailVerified={user.emailVerified}
      createdAt={user.createdAt}
      lastLoginAt={user.lastLoginAt}
      passwordExpiresAt={user.passwordExpiresAt}
      description="Actualiza tus datos personales y la seguridad de tu cuenta de administrador."
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
        icon={KeyRound}
        title="Seguridad"
        description={textoSeguridad(user.passwordExpiresAt)}
      >
        <ChangePasswordForm />
      </ProfileSection>
    </ProfileShell>
  );
}
