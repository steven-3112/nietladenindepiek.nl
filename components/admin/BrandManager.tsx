'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Brand, Model } from '@/lib/db';

interface BrandManagerProps {
  initialBrands: Brand[];
}

export function BrandManager({ initialBrands }: BrandManagerProps) {
  const [brands, setBrands] = useState(initialBrands);
  const [models, setModels] = useState<Record<number, Model[]>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showAddModelForm, setShowAddModelForm] = useState<number | null>(null);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logoUrl: '',
  });

  const [modelFormData, setModelFormData] = useState({
    name: '',
    slug: '',
    yearRange: '',
  });

  const [importData, setImportData] = useState('');

  // Load models for each brand
  useEffect(() => {
    const loadModels = async () => {
      for (const brand of brands) {
        try {
          const response = await fetch(`/api/admin/brands/${brand.id}/models`);
          if (response.ok) {
            const brandModels = await response.json();
            setModels(prev => ({ ...prev, [brand.id]: brandModels }));
          }
        } catch (error) {
          console.error(`Error loading models for brand ${brand.id}:`, error);
        }
      }
    };
    loadModels();
  }, [brands]);

  function createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleCreate() {
    if (!formData.name.trim()) {
      setError('Merk naam is verplicht');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug || createSlug(formData.name),
          logoUrl: formData.logoUrl || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBrands([...brands, data]);
        setSuccess('Merk succesvol toegevoegd');
        setFormData({ name: '', slug: '', logoUrl: '' });
        setShowAddForm(false);
      } else {
        setError(data.error || 'Er ging iets mis');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    if (!editingBrand || !formData.name.trim()) {
      setError('Merk naam is verplicht');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/brands/${editingBrand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug || createSlug(formData.name),
          logoUrl: formData.logoUrl || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBrands(brands.map(b => b.id === editingBrand.id ? data : b));
        setSuccess('Merk succesvol bijgewerkt');
        setEditingBrand(null);
        setFormData({ name: '', slug: '', logoUrl: '' });
      } else {
        setError(data.error || 'Er ging iets mis');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(brandId: number) {
    if (!confirm('Weet je zeker dat je dit merk wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/brands/${brandId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBrands(brands.filter(b => b.id !== brandId));
        setSuccess('Merk succesvol verwijderd');
      } else {
        const data = await response.json();
        setError(data.error || 'Er ging iets mis');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (!importData.trim()) {
      setError('Import data is verplicht');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/brands/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: importData }),
      });

      const data = await response.json();

      if (response.ok) {
        setBrands(data.brands);
        setSuccess(`${data.importedBrands} merken en ${data.importedModels} modellen geïmporteerd`);
        setImportData('');
        setShowImportForm(false);
      } else {
        setError(data.error || 'Er ging iets mis');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  // Model CRUD functions
  async function handleCreateModel(brandId: number) {
    if (!modelFormData.name.trim()) {
      setError('Model naam is verplicht');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/brands/${brandId}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelFormData.name.trim(),
          slug: modelFormData.slug || createSlug(modelFormData.name),
          yearRange: modelFormData.yearRange || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModels(prev => ({
          ...prev,
          [brandId]: [...(prev[brandId] || []), data]
        }));
        setSuccess('Model succesvol toegevoegd');
        setModelFormData({ name: '', slug: '', yearRange: '' });
        setShowAddModelForm(null);
      } else {
        setError(data.error || 'Er ging iets mis');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateModel() {
    if (!editingModel || !modelFormData.name.trim()) {
      setError('Model naam is verplicht');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/models/${editingModel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: modelFormData.name.trim(),
          slug: modelFormData.slug || createSlug(modelFormData.name),
          yearRange: modelFormData.yearRange || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModels(prev => ({
          ...prev,
          [editingModel.brand_id]: prev[editingModel.brand_id]?.map(m => 
            m.id === editingModel.id ? data : m
          ) || []
        }));
        setSuccess('Model succesvol bijgewerkt');
        setEditingModel(null);
        setModelFormData({ name: '', slug: '', yearRange: '' });
      } else {
        setError(data.error || 'Er ging iets mis');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteModel(modelId: number, brandId: number) {
    if (!confirm('Weet je zeker dat je dit model wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setModels(prev => ({
          ...prev,
          [brandId]: prev[brandId]?.filter(m => m.id !== modelId) || []
        }));
        setSuccess('Model succesvol verwijderd');
      } else {
        const data = await response.json();
        setError(data.error || 'Er ging iets mis');
      }
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  function startEdit(brand: Brand) {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo_url || '',
    });
    setShowAddForm(false);
  }

  function cancelEdit() {
    setEditingBrand(null);
    setFormData({ name: '', slug: '', logoUrl: '' });
  }

  function startEditModel(model: Model) {
    setEditingModel(model);
    setModelFormData({
      name: model.name,
      slug: model.slug,
      yearRange: model.year_range || '',
    });
    setShowAddModelForm(null);
  }

  function cancelEditModel() {
    setEditingModel(null);
    setModelFormData({ name: '', slug: '', yearRange: '' });
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setShowImportForm(false);
            cancelEdit();
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showAddForm ? 'Annuleren' : 'Nieuw merk toevoegen'}
        </button>
        <button
          onClick={() => {
            setShowImportForm(!showImportForm);
            setShowAddForm(false);
            cancelEdit();
          }}
          className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {showImportForm ? 'Annuleren' : 'Importeren'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingBrand) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingBrand ? 'Merk bewerken' : 'Nieuw merk toevoegen'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merk naam *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Bijv. Tesla"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Wordt automatisch gegenereerd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL (optioneel)
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={editingBrand ? handleUpdate : handleCreate}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Bezig...' : (editingBrand ? 'Bijwerken' : 'Toevoegen')}
              </button>
              {editingBrand && (
                <button
                  onClick={cancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Annuleren
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Form */}
      {showImportForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Merken importeren
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tab-separated data (merk, type)
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tesla	Model 3&#10;Tesla	Model Y&#10;Volkswagen	ID.3&#10;Volkswagen	ID.4&#10;BMW	i3&#10;BMW	iX3"
              />
              <p className="text-sm text-gray-500 mt-1">
                Eerste kolom: merk naam, tweede kolom: model naam. Beide worden geïmporteerd.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={loading}
                className="bg-secondary-600 hover:bg-secondary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Importeren...' : 'Importeren'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brands List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Merken ({brands.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {brands.map((brand) => (
            <div key={brand.id} className="p-6">
              {/* Brand Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {brand.logo_url && (
                    <div className="relative w-12 h-12">
                      <Image
                        src={brand.logo_url}
                        alt={`${brand.name} logo`}
                        fill
                        className="object-contain"
                        sizes="48px"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Slug: {brand.slug}
                    </p>
                    <p className="text-sm text-gray-600">
                      {brand.guide_count} handleiding{brand.guide_count !== 1 ? 'en' : ''}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      brand.status === 'APPROVED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {brand.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddModelForm(showAddModelForm === brand.id ? null : brand.id)}
                    className="text-secondary-600 hover:text-secondary-800 text-sm font-medium"
                  >
                    {showAddModelForm === brand.id ? 'Annuleren' : 'Model toevoegen'}
                  </button>
                  <button
                    onClick={() => startEdit(brand)}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    Bewerken
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Verwijderen
                  </button>
                </div>
              </div>

              {/* Add/Edit Model Form */}
              {(showAddModelForm === brand.id || editingModel) && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    {editingModel ? 'Model bewerken' : 'Nieuw model toevoegen'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model naam *
                      </label>
                      <input
                        type="text"
                        value={modelFormData.name}
                        onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Bijv. Model 3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={modelFormData.slug}
                        onChange={(e) => setModelFormData({ ...modelFormData, slug: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Wordt automatisch gegenereerd"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jaar bereik
                      </label>
                      <input
                        type="text"
                        value={modelFormData.yearRange}
                        onChange={(e) => setModelFormData({ ...modelFormData, yearRange: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Bijv. 2017-heden"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={editingModel ? handleUpdateModel : () => handleCreateModel(brand.id)}
                      disabled={loading}
                      className="bg-secondary-600 hover:bg-secondary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {loading ? 'Bezig...' : (editingModel ? 'Bijwerken' : 'Toevoegen')}
                    </button>
                    {editingModel && (
                      <button
                        onClick={cancelEditModel}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Annuleren
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Models List */}
              <div className="ml-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                  Modellen ({models[brand.id]?.length || 0})
                </h4>
                {models[brand.id] && models[brand.id].length > 0 ? (
                  <div className="space-y-2">
                    {models[brand.id].map((model) => (
                      <div key={model.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div>
                          <span className="font-medium text-gray-900">{model.name}</span>
                          <span className="text-sm text-gray-600 ml-2">({model.slug})</span>
                          {model.year_range && (
                            <span className="text-sm text-gray-500 ml-2">- {model.year_range}</span>
                          )}
                          <span className="text-sm text-gray-500 ml-2">
                            - {model.guide_count} handleiding{model.guide_count !== 1 ? 'en' : ''}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ml-2 ${
                            model.status === 'APPROVED' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {model.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditModel(model)}
                            className="text-primary-600 hover:text-primary-800 text-sm"
                          >
                            Bewerken
                          </button>
                          <button
                            onClick={() => handleDeleteModel(model.id, brand.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Verwijderen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Geen modellen toegevoegd</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
