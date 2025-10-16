import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { rejectGuide, getGuideWithSteps } from '@/lib/db';
import { sendRejectionEmail } from '@/lib/email';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !hasRole(session.user.roles, 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await request.json();
    const guideId = parseInt(params.id);
    const guide = await getGuideWithSteps(guideId);

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    await rejectGuide(guideId);

    // Send rejection email
    if (guide.submitted_by_email) {
      const modelNames = guide.models.map(m => `${m.brand_name} ${m.name}`);
      await sendRejectionEmail(
        guide.submitted_by_email,
        guide.submitted_by_name,
        modelNames,
        reason
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rejecting guide:', error);
    return NextResponse.json({ error: 'Failed to reject guide' }, { status: 500 });
  }
}

