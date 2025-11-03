import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getBrandBySlug, getModelsByBrandWithGuideCount } from '@/lib/db';

interface PageProps {
  params: { brand: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const brand = await getBrandBySlug(params.brand);
  const brandName = brand?.name || params.brand;
  return {
    title: `${brandName} – Handleidingen`,
    description: `Vind laad- en energie-handleidingen voor ${brandName}.`,
  };
}

export default async function BrandPage({ params }: PageProps) {
  const brand = await getBrandBySlug(params.brand);
  if (!brand) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Merk niet gevonden</h1>
          <p className="text-gray-600 mb-6">We konden dit merk niet vinden. Ga terug naar het overzicht.</p>
          <Link href="/" className="text-primary-600 hover:text-primary-800">Terug naar home</Link>
        </div>
      </main>
    );
  }

  const models = await getModelsByBrandWithGuideCount(brand.id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Terug naar merken</span>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kies je {brand.name} model</h1>
        <p className="text-gray-600 mb-8">Selecteer je model om beschikbare handleidingen te bekijken.</p>

        {models.length > 0 ? (
          <div className="space-y-8">
            {models.filter(m => Number(m.guide_count) > 0).length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-green-700 mb-4">Modellen met handleidingen</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {models.filter(m => Number(m.guide_count) > 0).map((model) => (
                    <Link
                      key={model.id}
                      href={`/handleiding/${brand.slug}/${model.slug}`}
                      className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-700 transition-colors mb-1">{model.name}</h3>
                          {model.year_range && (
                            <p className="text-sm text-gray-600 mb-2">{model.year_range}</p>
                          )}
                          <div className="inline-flex items-center gap-2 text-xs font-medium text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>
                            {Number(model.guide_count)} handleiding{Number(model.guide_count) !== 1 ? 'en' : ''}
                          </div>
                        </div>
                        <svg className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {models.filter(m => Number(m.guide_count) === 0).length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Modellen zonder handleidingen</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {models.filter(m => Number(m.guide_count) === 0).map((model) => (
                    <Link
                      key={model.id}
                      href={`/handleiding/${brand.slug}/${model.slug}`}
                      className="group bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors mb-1">{model.name}</h3>
                          {model.year_range && (
                            <p className="text-xs text-gray-500 mb-1">{model.year_range}</p>
                          )}
                          <div className="inline-flex items-center gap-2 text-[11px] font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                            Geen handleiding
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Geen handleiding voor jouw model? <span className="text-primary-600 font-medium">Voeg er een toe!</span>
                </p>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-2">Geen modellen gevonden voor {brand.name}</p>
            <p className="text-sm text-gray-500">Probeer een ander merk</p>
          </div>
        )}
      </div>
    </main>
  );
}


