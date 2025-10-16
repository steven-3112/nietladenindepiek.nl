import Link from 'next/link';
import { getModelBySlug, getGuidesByModel } from '@/lib/db';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    brand: string;
    model: string;
  };
}

export default async function HandleidingPage({ params }: PageProps) {
  const model = await getModelBySlug(params.brand, params.model);

  if (!model) {
    notFound();
  }

  const guides = await getGuidesByModel(model.id, 'APPROVED');

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-primary-600 hover:text-primary-800">
            ← Terug naar home
          </Link>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {model.brand_name} {model.name}
          </h1>
          {model.year_range && (
            <p className="text-gray-600">Model: {model.year_range}</p>
          )}
        </div>

        {guides.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Helaas, er is nog geen handleiding
            </h2>
            <p className="text-gray-600 mb-6">
              Voor deze auto hebben we nog geen handleiding beschikbaar.
              Kun jij ons helpen?
            </p>
            <Link
              href="/indienen"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Handleiding toevoegen
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Beschikbare handleidingen
            </h2>
            <p className="text-gray-600 mb-6">
              Er zijn meerdere handleidingen beschikbaar. Kies degene die het beste bij jou past:
            </p>

            <div className="space-y-4">
              {guides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/handleiding/${params.brand}/${params.model}/${guide.id}`}
                  className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Handleiding door {guide.submitted_by_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Toegevoegd in {guide.year}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <span>👍</span>
                          <span className="font-medium">{guide.helpful_count}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <span>👎</span>
                          <span className="font-medium">{guide.not_helpful_count}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <svg
                        className="w-6 h-6 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Werkt geen van deze handleidingen goed voor jou?
              </p>
              <Link
                href="/indienen"
                className="inline-block bg-secondary-600 hover:bg-secondary-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Verbeterde handleiding toevoegen
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

