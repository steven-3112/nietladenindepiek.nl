'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FeedbackButtonsProps {
  guideId: number;
}

export function FeedbackButtons({ guideId }: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFeedback(isHelpful: boolean) {
    setLoading(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId, isHelpful }),
      });
      setFeedback(isHelpful ? 'helpful' : 'not_helpful');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  }

  if (feedback === 'helpful') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Bedankt voor je feedback!
        </h3>
        <p className="text-gray-600">
          Fijn dat de handleiding je geholpen heeft!
        </p>
      </div>
    );
  }

  if (feedback === 'not_helpful') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-4xl mb-3">🤔</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Bedankt voor je feedback
        </h3>
        <p className="text-gray-600 mb-4">
          Jammer dat deze handleiding niet werkte. Wil je een verbeterde versie indienen?
        </p>
        <Link
          href="/indienen"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Verbeterde handleiding indienen
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
        Was deze handleiding nuttig?
      </h3>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => handleFeedback(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <span>👍</span>
          <span>Ja, gelukt!</span>
        </button>
        <button
          onClick={() => handleFeedback(false)}
          disabled={loading}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          <span>👎</span>
          <span>Nee, niet gelukt</span>
        </button>
      </div>
    </div>
  );
}

