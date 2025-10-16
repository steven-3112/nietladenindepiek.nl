import { NextResponse } from 'next/server';
import { createGuide, getAllUsers } from '@/lib/db';
import { sendNewSubmissionEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { submitterName, submitterEmail, modelIds, steps } = await request.json();

    if (!submitterName || !modelIds || modelIds.length === 0 || !steps || steps.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Create the guide
    const guide = await createGuide(submitterName, submitterEmail, modelIds, steps);

    // Send email to moderators
    const users = await getAllUsers();
    const moderatorEmails = users
      .filter(user => user.roles.includes('MODERATOR'))
      .map(user => user.email);

    if (moderatorEmails.length > 0) {
      const modelNames = modelIds.map((id: number) => `Model ${id}`); // Simplified for now
      await sendNewSubmissionEmail(moderatorEmails, submitterName, modelNames, guide.id);
    }

    return NextResponse.json({ success: true, guideId: guide.id });
  } catch (error) {
    console.error('Error submitting guide:', error);
    return NextResponse.json({ error: 'Failed to submit guide' }, { status: 500 });
  }
}

