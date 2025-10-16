'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Guide {
  id: number;
  submitted_by_name: string;
  submitted_by_email: string;
  model_names: string[];
  created_at: string;
}

interface GuideApprovalListProps {
  initialGuides: Guide[];
}

export function GuideApprovalList({ initialGuides }: GuideApprovalListProps) {
  const [guides, setGuides] = useState(initialGuides);
  const [expandedGuide, setExpandedGuide] = useState<number | null>(null);
  const [guideDetails, setGuideDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  async function loadGuideDetails(guideId: number) {
    if (expandedGuide === guideId) {
      setExpandedGuide(null);
      setGuideDetails(null);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/guides/${guideId}/details`);
      const data = await response.json();
      setGuideDetails(data);
      setExpandedGuide(guideId);
    } catch (error) {
      console.error('Error loading guide details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function approveGuide(guideId: number) {
    if (!confirm('Weet je zeker dat je deze handleiding wilt goedkeuren?')) {
      return;
    }

    try {
      const response = await fetch(`/api/guides/${guideId}/approve`, {
        method: 'POST',
      });

      if (response.ok) {
        setGuides(guides.filter(g => g.id !== guideId));
        setExpandedGuide(null);
        setGuideDetails(null);
      }
    } catch (error) {
      console.error('Error approving guide:', error);
      alert('Er ging iets mis bij het goedkeuren.');
    }
  }

  async function rejectGuide(guideId: number) {
    try {
      const response = await fetch(`/api/guides/${guideId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        setGuides(guides.filter(g => g.id !== guideId));
        setExpandedGuide(null);
        setGuideDetails(null);
        setShowRejectModal(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error rejecting guide:', error);
      alert('Er ging iets mis bij het afwijzen.');
    }
  }

  return (
    <>
      <div className="space-y-4">
        {guides.map((guide) => (
          <div key={guide.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Handleiding door {guide.submitted_by_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Email: {guide.submitted_by_email || 'Niet opgegeven'}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Voor: {guide.model_names.join(', ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ingediend: {new Date(guide.created_at).toLocaleDateString('nl-NL')}
                  </p>
                </div>

                <button
                  onClick={() => loadGuideDetails(guide.id)}
                  className="ml-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  {expandedGuide === guide.id ? 'Verberg' : 'Bekijk'}
                </button>
              </div>

              {expandedGuide === guide.id && guideDetails && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="font-bold text-gray-900 mb-4">Stappen:</h4>
                  <div className="space-y-6">
                    {guideDetails.steps
                      .sort((a: any, b: any) => a.step_number - b.step_number)
                      .map((step: any) => (
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

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => approveGuide(guide.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      ✅ Goedkeuren
                    </button>
                    <button
                      onClick={() => setShowRejectModal(guide.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      ❌ Afwijzen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Handleiding afwijzen
            </h3>
            <p className="text-gray-600 mb-4">
              Wil je een reden opgeven? (optioneel, wordt gemaild naar de indiener)
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Bijvoorbeeld: De stappen kloppen niet met dit model..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={() => rejectGuide(showRejectModal)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Afwijzen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

