import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllBrands } from '@/lib/db';

export default async function AutosPage() {
  const session = await getServerSession(authOptions);

  if (!session || !hasRole(session.user.roles, 'CATALOG_MANAGER')) {
    redirect('/admin');
  }

  const brands = await getAllBrands();

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Auto's beheren
      </h1>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Merken</h2>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand.id} className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold">{brand.name}</h3>
              <p className="text-sm text-gray-600">Slug: {brand.slug}</p>
            </div>
          ))}
        </div>
        
        <p className="mt-8 text-gray-600 text-center">
          Volledige CRUD functionaliteit komt binnenkort...
        </p>
      </div>
    </div>
  );
}

