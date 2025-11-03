'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Brand {
  id: number;
  name: string;
  slug: string;
  guide_count: string; // Database returns this as string
}

interface Model {
  id: number;
  name: string;
  slug: string;
  year_range: string;
  guide_count: string; // Database returns this as string
}

// Car brand domain mapping for logo.dev
const brandDomains: Record<string, string> = {
  'tesla': 'tesla.com',
  'volkswagen': 'vw.com',
  'bmw': 'bmw.com',
  'nissan': 'nissan.com',
  'audi': 'audi.com',
  'mercedes': 'mercedes-benz.com',
  'volvo': 'volvo.com',
  'polestar': 'polestar.com',
  'hyundai': 'hyundai.com',
  'kia': 'kia.com',
  'ford': 'ford.com',
  'renault': 'renault.com',
  'peugeot': 'peugeot.com',
  'byd': 'byd.com',
  'porsche': 'porsche.com',
  'opel': 'opel.com',
  'skoda': 'skoda.com',
  'seat': 'seat.com',
  'mg': 'mg.com',
  'citroen': 'citroen.com',
  'mazda': 'mazda.com',
  'lexus': 'lexus.com',
  'jaguar': 'jaguar.com',
  'mini': 'mini.com',
  'smart': 'smart.com',
  'fiat': 'fiat.com',
};

// Get logo URL from logo.dev
function getLogoUrl(brandSlug: string): string {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  const domain = brandDomains[brandSlug.toLowerCase()];
  const targetDomain = domain || `${brandSlug}.com`;
  
  // Logo.dev doesn't require a token for basic usage, but adds one if available
  const url = token 
    ? `https://img.logo.dev/${targetDomain}?token=${token}&size=200`
    : `https://img.logo.dev/${targetDomain}?size=200`;
  
  return url;
}

export function CarSelector() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchModels(selectedBrand.slug);
    } else {
      setModels([]);
    }
  }, [selectedBrand]);

  async function fetchBrands() {
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchModels(brandSlug: string) {
    try {
      const response = await fetch(`/api/brands/${brandSlug}/models`);
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  }

  function handleBrandClick(brand: Brand) {
    // Navigate to brand-specific URL so the browser back button works as expected
    router.push(`/handleiding/${brand.slug}`);
  }

  function handleModelClick(modelSlug: string) {
    if (selectedBrand) {
      router.push(`/handleiding/${selectedBrand.slug}/${modelSlug}`);
    }
  }

  function handleBack() {
    setSelectedBrand(null);
    setModels([]);
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Auto&apos;s laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedBrand ? (
        /* Brand Grid */
        <div>
          
          {/* Brands with guides */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-green-700 mb-4 flex items-center gap-2">
              Merken met handleidingen ({brands.filter(b => parseInt(b.guide_count) > 0).length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {brands.filter(brand => parseInt(brand.guide_count) > 0).map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleBrandClick(brand)}
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <Image
                        src={getLogoUrl(brand.slug)}
                        alt={`${brand.name} logo`}
                        fill
                        className="object-contain"
                        sizes="64px"
                        unoptimized
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                      {brand.name}
                    </h4>
                    <p className="text-xs text-green-600 mt-1">
                      {parseInt(brand.guide_count)} handleiding{parseInt(brand.guide_count) !== 1 ? 'en' : ''}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Brands without guides */}
          {brands.filter(b => parseInt(b.guide_count) === 0).length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-600 mb-4 flex items-center gap-2">
                Merken zonder handleidingen ({brands.filter(b => parseInt(b.guide_count) === 0).length})
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {brands.filter(brand => parseInt(brand.guide_count) === 0).map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleBrandClick(brand)}
                    className="group relative bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="text-center">
                      <h4 className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                        {brand.name}
                      </h4>
                    </div>
                    <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-20 rounded-lg transition-opacity"></div>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                Geen handleiding voor jouw merk? <span className="text-primary-600 font-medium">Voeg er een toe!</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Model Grid */
        <div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Andere merk kiezen</span>
          </button>

          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Kies je {selectedBrand.name} model
          </h3>

          {models.length > 0 ? (
            <div className="space-y-6">
              {/* Models with guides */}
              {models.filter(m => parseInt(m.guide_count) > 0).length > 0 && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {models.filter(model => parseInt(model.guide_count) > 0).map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelClick(model.slug)}
                        className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-primary-700 transition-colors mb-1">
                              {model.name}
                            </h4>
                            {model.year_range && (
                              <p className="text-sm text-gray-600 mb-2">{model.year_range}</p>
                            )}
                            <div className="inline-flex items-center gap-2 text-xs font-medium text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-600"></span>
                              {parseInt(model.guide_count)} handleiding{parseInt(model.guide_count) !== 1 ? 'en' : ''}
                            </div>
                          </div>
                          <svg
                            className="w-6 h-6 text-gray-400 group-hover:text-primary-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Models without guides */}
              {models.filter(m => parseInt(m.guide_count) === 0).length > 0 && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {models.filter(model => parseInt(model.guide_count) === 0).map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleModelClick(model.slug)}
                        className="group bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200 hover:-translate-y-1 text-left"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-700 group-hover:text-gray-900 transition-colors mb-1">
                              {model.name}
                            </h4>
                            {model.year_range && (
                              <p className="text-xs text-gray-500 mb-1">{model.year_range}</p>
                            )}
                            <div className="inline-flex items-center gap-2 text-[11px] font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                              Geen handleiding
                            </div>
                          </div>
                          <svg
                            className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Geen handleiding voor jouw model? <span className="text-primary-600 font-medium">Voeg er een toe!</span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <p className="text-gray-600 mb-2">Geen modellen gevonden voor {selectedBrand.name}</p>
              <p className="text-sm text-gray-500">Probeer een ander merk</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

