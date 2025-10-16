'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface Model {
  id: number;
  name: string;
  slug: string;
  year_range: string;
}

// Car brand emoji mapping
const brandEmojis: Record<string, string> = {
  'tesla': '⚡',
  'volkswagen': '🚙',
  'bmw': '🏁',
  'nissan': '🔋',
  'audi': '🔷',
  'mercedes': '⭐',
  'volvo': '🔶',
  'polestar': '⭐',
  'hyundai': '🌟',
  'kia': '🎯',
  'ford': '🦅',
  'renault': '💎',
  'peugeot': '🦁',
  'byd': '🐉',
};

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
    setSelectedBrand(brand);
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
        <p className="mt-4 text-gray-600">Auto's laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedBrand ? (
        /* Brand Grid */
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Kies het merk van je auto
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(brand)}
                className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {brandEmojis[brand.slug.toLowerCase()] || '🚗'}
                  </div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                    {brand.name}
                  </h4>
                </div>
                <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
              </button>
            ))}
          </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {models.map((model) => (
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
                        <p className="text-sm text-gray-600">{model.year_range}</p>
                      )}
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

