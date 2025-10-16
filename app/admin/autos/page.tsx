import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllBrandsWithGuideCount } from '@/lib/db';
import { BrandManager } from '@/components/admin/BrandManager';

export default async function AutosPage() {
  const session = await getServerSession(authOptions);

  if (!session || !hasRole(session.user.roles, 'CATALOG_MANAGER')) {
    redirect('/admin');
  }

  const brands = await getAllBrandsWithGuideCount(true);

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Auto&apos;s beheren
      </h1>

      <BrandManager initialBrands={brands} />
    </div>
  );
}

