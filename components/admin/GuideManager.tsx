'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Guide } from '@/lib/db';
import { GuideEditModal } from './GuideEditModal';

interface GuideModel {
  id: number;
  name: string;
  brand_name: string;
  status: string;
}

interface GuideStep {
  id: number;
  step_number: number;
  description: string;
  image_url?: string;
}

interface GuideDetails {
  models: GuideModel[];
  steps: GuideStep[];
}

interface GuideManagerProps {
  initialGuides: Guide[];
}

export function GuideManager({ initialGuides }: GuideManagerProps) {
  const [guides, setGuides] = useState(initialGuides);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [guideDetails, setGuideDetails] = useState<GuideDetails | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check for edit parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      const guideToEdit = guides.find(g => g.id === parseInt(editId));
      if (guideToEdit) {
        setEditingGuide(guideToEdit);
        setShowEditModal(true);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [guides]);

  const filteredGuides = guides.filter(guide => {
    const matchesFilter = filter === 'ALL' || guide.status === filter;
    const matchesSearch = searchTerm === '' || 
      guide.submitted_by_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.model_names.some(name => name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  async function loadGuideDetails(guideId: number) {
    if (expandedGuide === guideId) {
      setExpandedGuide(null);
      setGuideDetails(null);
      return;
    }

    try {
      const response = await fetch(`/api/guides/${guideId}/details`);
      const data = await response.json();
      setGuideDetails(data);
      setExpandedGuide(guideId);
    } catch (error) {
      console.error('Error loading guide details:', error);
    }
  }

  async function updateGuideStatus(guideId: number, newStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE') {
    if (!confirm(`Weet je zeker dat je deze handleiding wilt ${getStatusAction(newStatus)}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/guides/${guideId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setGuides(guides.map(g => 
          g.id === guideId ? { ...g, status: newStatus } : g
        ));
        setExpandedGuide(null);
        setGuideDetails(null);
      }
    } catch (error) {
      console.error('Error updating guide status:', error);
      alert('Er ging iets mis bij het bijwerken van de status.');
    }
  }

  async function handleEditGuide(guideId: number) {
    const guide = guides.find(g => g.id === guideId);
    if (!guide) return;

    // Load guide details if not already loaded
    if (!guideDetails || expandedGuide !== guideId) {
      await loadGuideDetails(guideId);
    }

    setEditingGuide(guide);
    setShowEditModal(true);
  }

  async function handleSaveGuide(updatedData: {
    submittedByName: string;
    submittedByEmail: string | null;
    steps: Array<{
      id: number;
      stepNumber: number;
      description: string;
      imageUrl?: string;
      action: 'update' | 'delete' | 'add';
    }>;
  }) {
    if (!editingGuide) return;

    try {
      const response = await fetch(`/api/admin/guides/${editingGuide.id}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        // Update the guide in the list
        setGuides(guides.map(g => 
          g.id === editingGuide.id 
            ? { ...g, submitted_by_name: updatedData.submittedByName, submitted_by_email: updatedData.submittedByEmail }
            : g
        ));
        
        // Reload guide details to show updated steps
        if (expandedGuide === editingGuide.id) {
          await loadGuideDetails(editingGuide.id);
        }
        
        setShowEditModal(false);
        setEditingGuide(null);
      }
    } catch (error) {
      console.error('Error saving guide:', error);
      alert('Er ging iets mis bij het opslaan van de handleiding.');
    }
  }

  function getStatusAction(status: string): string {
    switch (status) {
      case 'PENDING': return 'terugzetten naar wachtend';
      case 'APPROVED': return 'goedkeuren';
      case 'REJECTED': return 'afwijzen';
      case 'OFFLINE': return 'offline halen';
      default: return 'bijwerken';
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'OFFLINE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Wachtend';
      case 'APPROVED': return 'Goedgekeurd';
      case 'REJECTED': return 'Afgewezen';
      case 'OFFLINE': return 'Offline';
      default: return status;
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Zoek op naam of model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'OFFLINE'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'ALL' ? 'Alle' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {filteredGuides.length} van {guides.length} handleidingen
        </div>
      </div>

      {/* Guides List */}
      <div className="space-y-4">
        {filteredGuides.map((guide) => (
          <div key={guide.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Handleiding door {guide.submitted_by_name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guide.status)}`}>
                      {getStatusLabel(guide.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Email: {guide.submitted_by_email || 'Niet opgegeven'}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Voor: {guide.model_names.join(', ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ingediend: {new Date(guide.created_at).toLocaleDateString('nl-NL')}
                    {guide.updated_at && guide.updated_at !== guide.created_at && (
                      <span> • Bijgewerkt: {new Date(guide.updated_at).toLocaleDateString('nl-NL')}</span>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => loadGuideDetails(guide.id)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                  >
                    {expandedGuide === guide.id ? 'Verberg' : 'Bekijk'}
                  </button>
                  <button
                    onClick={() => handleEditGuide(guide.id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Bewerken
                  </button>
                </div>
              </div>

              {expandedGuide === guide.id && guideDetails && (
                <div className="mt-6 border-t pt-6">
                  {/* Show new models/brands warning */}
                  {guideDetails.models && guideDetails.models.some((m) => m.status === 'PENDING') && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong>Let op:</strong> Deze handleiding bevat nieuwe merken/modellen die nog niet in de database staan.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <h4 className="font-bold text-gray-900 mb-4">Stappen:</h4>
                  <div className="space-y-6">
                    {guideDetails.steps
                      .sort((a, b) => a.step_number - b.step_number)
                      .map((step) => (
                        <div key={step.id} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {step.step_number}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 whitespace-pre-wrap mb-3">
                              {step.description}
                            </p>
                            {step.image_url && (
                              <div className="relative w-full max-w-md h-48 rounded-lg overflow-hidden">
                                <Image
                                  src={step.image_url}
                                  alt={`Stap ${step.step_number}`}
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 768px) 100vw, 448px"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="flex gap-2 mt-8 flex-wrap">
                    {guide.status !== 'PENDING' && (
                      <button
                        onClick={() => updateGuideStatus(guide.id, 'PENDING')}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        ⏳ Wachtend
                      </button>
                    )}
                    {guide.status !== 'APPROVED' && (
                      <button
                        onClick={() => updateGuideStatus(guide.id, 'APPROVED')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        ✅ Goedkeuren
                      </button>
                    )}
                    {guide.status !== 'REJECTED' && (
                      <button
                        onClick={() => updateGuideStatus(guide.id, 'REJECTED')}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        ❌ Afwijzen
                      </button>
                    )}
                    {guide.status !== 'OFFLINE' && (
                      <button
                        onClick={() => updateGuideStatus(guide.id, 'OFFLINE')}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        🔒 Offline
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Geen handleidingen gevonden
          </h2>
          <p className="text-gray-600">
            Probeer een andere zoekterm of filter.
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingGuide && guideDetails && (
        <GuideEditModal
          guide={editingGuide}
          guideDetails={guideDetails}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingGuide(null);
          }}
          onSave={handleSaveGuide}
        />
      )}
    </div>
  );
}
