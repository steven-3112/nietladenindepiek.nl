import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { getGuideWithSteps } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !hasRole(session.user.roles, 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guideId = parseInt(params.id);
    const guide = await getGuideWithSteps(guideId);

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error('Error fetching guide details:', error);
    return NextResponse.json({ error: 'Failed to fetch guide' }, { status: 500 });
  }
}

