import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { updateGuideDetails, updateGuideStep, deleteGuideStep, addGuideStep } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !hasRole(session.user.roles, 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guideId = parseInt(params.id);
    if (isNaN(guideId)) {
      return NextResponse.json({ error: 'Invalid guide ID' }, { status: 400 });
    }

    const { 
      submittedByName, 
      submittedByEmail, 
      steps 
    } = await request.json();

    // Update guide details
    await updateGuideDetails(guideId, submittedByName, submittedByEmail);

    // Update steps
    for (const step of steps) {
      if (step.action === 'update' && step.id) {
        await updateGuideStep(step.id, step.stepNumber, step.description, step.imageUrl);
      } else if (step.action === 'delete' && step.id) {
        await deleteGuideStep(step.id);
      } else if (step.action === 'add') {
        await addGuideStep(guideId, step.stepNumber, step.description, step.imageUrl);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating guide:', error);
    return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 });
  }
}
