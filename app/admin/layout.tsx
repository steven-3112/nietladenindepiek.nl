import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { SessionDebug } from '@/components/admin/SessionDebug';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userRoles = session.user.roles || [];
  const hasModerator = userRoles.includes('MODERATOR');
  const hasCatalogManager = userRoles.includes('CATALOG_MANAGER');
  const hasUserAdmin = userRoles.includes('USER_ADMIN');

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionDebug />
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                href="/admin"
                className="flex items-center px-4 text-lg font-bold text-primary-700"
              >
                Admin Dashboard
              </Link>

              <div className="hidden sm:flex sm:space-x-8 sm:ml-10">
                {hasModerator && (
                  <Link
                    href="/admin/handleidingen"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Handleidingen
                  </Link>
                )}
                {hasCatalogManager && (
                  <Link
                    href="/admin/autos"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Auto&apos;s
                  </Link>
                )}
                {hasUserAdmin && (
                  <Link
                    href="/admin/gebruikers"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Gebruikers
                  </Link>
                )}
                <Link
                  href="/admin/wachtwoord"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Wachtwoord
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session.user.name}
              </span>
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Website →
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

