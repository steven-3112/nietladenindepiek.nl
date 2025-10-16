'use client';

import { useState, useEffect } from 'react';
import { Guide } from '@/lib/db';

interface GuideStep {
  id: number;
  step_number: number;
  description: string;
  image_url?: string;
}

interface UpdatedGuideData {
  submittedByName: string;
  submittedByEmail: string | null;
  steps: Array<{
    id: number;
    stepNumber: number;
    description: string;
    imageUrl?: string;
    action: 'update' | 'delete' | 'add';
  }>;
}

interface GuideEditModalProps {
  guide: Guide;
  guideDetails: {
    models: Array<{ id: number; name: string; brand_name: string; status: string }>;
    steps: GuideStep[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGuide: UpdatedGuideData) => void;
}

export function GuideEditModal({ guide, guideDetails, isOpen, onClose, onSave }: GuideEditModalProps) {
  const [editedGuide, setEditedGuide] = useState({
    submittedByName: guide.submitted_by_name,
    submittedByEmail: guide.submitted_by_email || '',
  });
  const [editedSteps, setEditedSteps] = useState<Array<GuideStep & { action?: 'update' | 'delete' | 'add' }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditedGuide({
        submittedByName: guide.submitted_by_name,
        submittedByEmail: guide.submitted_by_email || '',
      });
      setEditedSteps(guideDetails.steps.map(step => ({ ...step })));
    }
  }, [isOpen, guide, guideDetails]);

  const handleStepChange = (stepIndex: number, field: string, value: string | number) => {
    const newSteps = [...editedSteps];
    newSteps[stepIndex] = {
      ...newSteps[stepIndex],
      [field]: value,
      action: newSteps[stepIndex].action || 'update'
    };
    setEditedSteps(newSteps);
  };

  const handleDeleteStep = (stepIndex: number) => {
    const newSteps = [...editedSteps];
    if (newSteps[stepIndex].id) {
      newSteps[stepIndex].action = 'delete';
    } else {
      newSteps.splice(stepIndex, 1);
    }
    setEditedSteps(newSteps);
  };

  const handleAddStep = () => {
    const newStepNumber = Math.max(...editedSteps.map(s => s.step_number), 0) + 1;
    setEditedSteps([...editedSteps, {
      id: 0,
      step_number: newStepNumber,
      description: '',
      image_url: '',
      action: 'add'
    }]);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const stepsToSave = editedSteps
        .filter(step => step.action !== 'delete')
        .map(step => ({
          id: step.id,
          stepNumber: step.step_number,
          description: step.description,
          imageUrl: step.image_url,
          action: step.action || 'update'
        }));

      const deletedSteps = editedSteps
        .filter(step => step.action === 'delete' && step.id)
        .map(step => ({ 
          id: step.id, 
          stepNumber: step.step_number, 
          description: step.description, 
          imageUrl: step.image_url,
          action: 'delete' as const 
        }));

      await onSave({
        submittedByName: editedGuide.submittedByName,
        submittedByEmail: editedGuide.submittedByEmail || null,
        steps: [...stepsToSave, ...deletedSteps]
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving guide:', error);
      alert('Er ging iets mis bij het opslaan.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Handleiding bewerken
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Guide Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Handleiding Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naam indiener
                </label>
                <input
                  type="text"
                  value={editedGuide.submittedByName}
                  onChange={(e) => setEditedGuide({ ...editedGuide, submittedByName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email indiener
                </label>
                <input
                  type="email"
                  value={editedGuide.submittedByEmail}
                  onChange={(e) => setEditedGuide({ ...editedGuide, submittedByEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Stappen</h3>
              <button
                onClick={handleAddStep}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                + Stap toevoegen
              </button>
            </div>

            <div className="space-y-4">
              {editedSteps.map((step, index) => {
                if (step.action === 'delete') return null;
                
                return (
                  <div key={step.id || `new-${index}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Stap:</span>
                        <input
                          type="number"
                          value={step.step_number}
                          onChange={(e) => handleStepChange(index, 'step_number', parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          min="1"
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteStep(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Beschrijving
                      </label>
                      <textarea
                        value={step.description}
                        onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Afbeelding URL (optioneel)
                      </label>
                      <input
                        type="url"
                        value={step.image_url || ''}
                        onChange={(e) => handleStepChange(index, 'image_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
}
