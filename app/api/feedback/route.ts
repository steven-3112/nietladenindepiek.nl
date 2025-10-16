import { NextResponse } from 'next/server';
import { updateGuideFeedback } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { guideId, isHelpful } = await request.json();

    if (!guideId || typeof isHelpful !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await updateGuideFeedback(guideId, isHelpful);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}

