import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPendingGuides } from '@/lib/db';
import { GuideApprovalList } from '@/components/admin/GuideApprovalList';

export default async function HandleidingenPage() {
  const session = await getServerSession(authOptions);

  if (!session || !hasRole(session.user.roles, 'MODERATOR')) {
    redirect('/admin');
  }

  const pendingGuides = await getPendingGuides();

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Handleidingen beoordelen
      </h1>

      {pendingGuides.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Alles is goedgekeurd!
          </h2>
          <p className="text-gray-600">
            Er zijn momenteel geen handleidingen die wachten op goedkeuring.
          </p>
        </div>
      ) : (
        <GuideApprovalList initialGuides={pendingGuides} />
      )}
    </div>
  );
}

