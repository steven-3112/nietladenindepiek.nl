import Link from 'next/link';
import Image from 'next/image';
import { CarSelector } from '@/components/CarSelector';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  const session = await getServerSession(authOptions);
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Niet laden in de piek logo"
                width={48}
                height={48}
                className="h-10 w-auto"
                priority
              />
              <h1 className="text-2xl font-bold text-primary-700">
                Niet laden in de piek
              </h1>
            </Link>
            {session && (
              <Link
                href="/admin"
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Help het energienet
          </h2>
          <div className="prose prose-lg mx-auto text-gray-700">
            <p className="text-xl mb-6">
              Tussen <strong className="text-primary-700">16:00 en 21:00 uur</strong> is
              de vraag naar elektriciteit op het hoogst. Als veel mensen dan hun
              elektrische auto laden, komt het energienet onder druk te staan.
            </p>
            <p className="text-lg mb-6">
              Door je auto <em>buiten deze piektijden</em> te laden, help je mee aan een
              stabiel energienet en een succesvollere energietransitie. Bovendien is
              stroom buiten de piek vaak goedkoper!
            </p>
            <div className="bg-secondary-50 border-l-4 border-secondary-500 p-6 my-8">
              <p className="text-lg font-semibold text-secondary-900 mb-2">
                💡 Dit is vooral relevant als je thuis laadt op je eigen oprit
              </p>
              <p className="text-base text-secondary-800">
                Bij publieke laadpalen zijn de tijden vaak beperkt. Thuis heb je de
                vrijheid om te kiezen wanneer je laadt!
              </p>
            </div>
          </div>
        </div>

        {/* Car Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Zoek de handleiding voor jouw auto
          </h3>
          <CarSelector />
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Staat jouw auto er niet bij of wil je een handleiding toevoegen?
          </p>
          <Link
            href="/indienen"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Handleiding toevoegen
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              Samen werken we aan een duurzame toekomst 🌱
            </p>
            <Link
              href="/over"
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              Over dit initiatief
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

