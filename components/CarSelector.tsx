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

export function CarSelector() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchModels(selectedBrand);
    } else {
      setModels([]);
      setSelectedModel('');
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

  function handleBrandChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedBrand(e.target.value);
  }

  function handleModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const modelSlug = e.target.value;
    setSelectedModel(modelSlug);
    
    if (modelSlug && selectedBrand) {
      router.push(`/handleiding/${selectedBrand}/${modelSlug}`);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Laden...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brand Selection */}
      <div>
        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
          Kies het merk van je auto
        </label>
        <select
          id="brand"
          value={selectedBrand}
          onChange={handleBrandChange}
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">-- Selecteer een merk --</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      {/* Model Selection */}
      {selectedBrand && (
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
            Kies het model
          </label>
          <select
            id="model"
            value={selectedModel}
            onChange={handleModelChange}
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">-- Selecteer een model --</option>
            {models.map((model) => (
              <option key={model.id} value={model.slug}>
                {model.name} {model.year_range && `(${model.year_range})`}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedBrand && models.length === 0 && (
        <div className="text-center py-4 text-gray-600">
          <p>Geen modellen gevonden voor dit merk.</p>
        </div>
      )}
    </div>
  );
}

