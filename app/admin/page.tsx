import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const userRoles = session?.user.roles || [];

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Welkom, {session?.user.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userRoles.includes('MODERATOR') && (
          <Link
            href="/admin/handleidingen"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Handleidingen beoordelen
            </h2>
            <p className="text-gray-600">
              Bekijk en keur ingediende handleidingen goed of af.
            </p>
          </Link>
        )}

        {userRoles.includes('CATALOG_MANAGER') && (
          <Link
            href="/admin/autos"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🚗</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Auto&apos;s beheren
            </h2>
            <p className="text-gray-600">
              Voeg merken en modellen toe of bewerk bestaande auto&apos;s.
            </p>
          </Link>
        )}

        {userRoles.includes('USER_ADMIN') && (
          <Link
            href="/admin/gebruikers"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Gebruikers beheren
            </h2>
            <p className="text-gray-600">
              Beheer gebruikers en wijs rollen toe.
            </p>
          </Link>
        )}

        <Link
          href="/admin/wachtwoord"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Wachtwoord wijzigen
          </h2>
          <p className="text-gray-600">
            Wijzig je eigen wachtwoord.
          </p>
        </Link>
      </div>
    </div>
  );
}

