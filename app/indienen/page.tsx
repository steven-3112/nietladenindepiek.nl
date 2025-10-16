'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

interface Step {
  stepNumber: number;
  description: string;
  imageFile: File | null;
  imagePreview: string | null;
}

export default function IndienenPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [steps, setSteps] = useState<Step[]>([
    { stepNumber: 1, description: '', imageFile: null, imagePreview: null },
  ]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      fetchModels(selectedBrand);
    } else {
      setModels([]);
      setSelectedModels([]);
    }
  }, [selectedBrand]);

  async function fetchBrands() {
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
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

  function handleModelToggle(modelId: number) {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  }

  function addStep() {
    setSteps([
      ...steps,
      { stepNumber: steps.length + 1, description: '', imageFile: null, imagePreview: null },
    ]);
  }

  function removeStep(index: number) {
    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber steps
    newSteps.forEach((step, i) => {
      step.stepNumber = i + 1;
    });
    setSteps(newSteps);
  }

  function handleStepDescriptionChange(index: number, description: string) {
    const newSteps = [...steps];
    newSteps[index].description = description;
    setSteps(newSteps);
  }

  function handleStepImageChange(index: number, file: File | null) {
    const newSteps = [...steps];
    newSteps[index].imageFile = file;
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newSteps[index].imagePreview = reader.result as string;
        setSteps([...newSteps]);
      };
      reader.readAsDataURL(file);
    } else {
      newSteps[index].imagePreview = null;
      setSteps(newSteps);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (selectedModels.length === 0) {
      alert('Selecteer minimaal één model');
      return;
    }

    if (steps.some(step => !step.description.trim())) {
      alert('Vul alle stappen in');
      return;
    }

    setLoading(true);

    try {
      // Upload images to Cloudinary and prepare data
      const stepsData = await Promise.all(
        steps.map(async (step) => {
          let imageUrl = null;
          
          if (step.imageFile) {
            const formData = new FormData();
            formData.append('file', step.imageFile);
            
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (uploadResponse.ok) {
              const { url } = await uploadResponse.json();
              imageUrl = url;
            }
          }
          
          return {
            stepNumber: step.stepNumber,
            description: step.description,
            imageUrl,
          };
        })
      );

      // Submit guide
      const response = await fetch('/api/submit-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitterName,
          submitterEmail: submitterEmail || null,
          modelIds: selectedModels,
          steps: stepsData,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Er ging iets mis bij het indienen. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('Error submitting guide:', error);
      alert('Er ging iets mis bij het indienen. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="text-primary-600 hover:text-primary-800">
              ← Terug naar home
            </Link>
          </div>
        </header>

        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bedankt voor je bijdrage!
            </h1>
            <p className="text-gray-600 mb-6">
              Je handleiding is ingediend en wacht op goedkeuring. We laten je weten
              zodra deze online staat!
            </p>
            <Link
              href="/"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Terug naar home
            </Link>
          </div>
        </section>
      </main>
    );
  }

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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Handleiding toevoegen
        </h1>
        <p className="text-gray-600 mb-8">
          Help anderen door een handleiding toe te voegen. Stap voor stap uitleggen
          hoe je de laadtijden instelt!
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Submitter Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Jouw gegevens
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naam of schuilnaam *
                </label>
                <input
                  type="text"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Bijvoorbeeld: Piet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optioneel, voor updates)
                </label>
                <input
                  type="email"
                  value={submitterEmail}
                  onChange={(e) => setSubmitterEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="bijvoorbeeld@email.nl"
                />
              </div>
            </div>
          </div>

          {/* Car Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Voor welke auto('s) is deze handleiding?
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merk *
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">-- Selecteer een merk --</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.slug}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedBrand && models.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modellen (meerdere mogelijk) *
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-4">
                    {models.map((model) => (
                      <label key={model.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedModels.includes(model.id)}
                          onChange={() => handleModelToggle(model.id)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-800">
                          {model.name} {model.year_range && `(${model.year_range})`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Steps */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Stappen
            </h2>
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Stap {step.stepNumber}</h3>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Verwijder
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Uitleg *
                      </label>
                      <textarea
                        value={step.description}
                        onChange={(e) => handleStepDescriptionChange(index, e.target.value)}
                        required
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Bijvoorbeeld: Open de app en ga naar instellingen..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto (optioneel)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleStepImageChange(index, e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-600"
                      />
                      {step.imagePreview && (
                        <div className="mt-4 relative w-full max-w-md h-48">
                          <Image
                            src={step.imagePreview}
                            alt={`Voorbeeld stap ${step.stepNumber}`}
                            fill
                            className="object-contain rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addStep}
              className="mt-4 w-full py-3 border-2 border-dashed border-primary-300 text-primary-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors font-medium"
            >
              + Stap toevoegen
            </button>
          </div>

          {/* Submit */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors text-lg"
            >
              {loading ? 'Bezig met indienen...' : 'Handleiding indienen'}
            </button>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Je handleiding wordt eerst beoordeeld voordat deze online komt
            </p>
          </div>
        </form>
      </section>
    </main>
  );
}

