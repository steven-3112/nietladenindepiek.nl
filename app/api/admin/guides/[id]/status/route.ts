import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { updateGuideStatus } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !hasRole(session.user.roles, 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    
    if (!['PENDING', 'APPROVED', 'REJECTED', 'OFFLINE'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const guideId = parseInt(params.id);
    if (isNaN(guideId)) {
      return NextResponse.json({ error: 'Invalid guide ID' }, { status: 400 });
    }

    await updateGuideStatus(guideId, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating guide status:', error);
    return NextResponse.json({ error: 'Failed to update guide status' }, { status: 500 });
  }
}
