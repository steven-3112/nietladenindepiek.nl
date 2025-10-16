import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllGuides } from '@/lib/db';
import { GuideManager } from '@/components/admin/GuideManager';

export default async function HandleidingenPage() {
  const session = await getServerSession(authOptions);

  if (!session || !hasRole(session.user.roles, 'MODERATOR')) {
    redirect('/admin');
  }

  const allGuides = await getAllGuides();

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Handleidingen beheren
      </h1>

      <GuideManager initialGuides={allGuides} />
    </div>
  );
}

