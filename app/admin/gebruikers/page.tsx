import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllUsers } from '@/lib/db';

export default async function GebruikersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !hasRole(session.user.roles, 'USER_ADMIN')) {
    redirect('/admin');
  }

  const users = await getAllUsers();

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Gebruikers beheren
      </h1>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Gebruikers</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-600">
                Rollen: {user.roles.join(', ') || 'Geen rollen'}
              </p>
            </div>
          ))}
        </div>
        
        <p className="mt-8 text-gray-600 text-center">
          Rol beheer functionaliteit komt binnenkort...
        </p>
      </div>
    </div>
  );
}

