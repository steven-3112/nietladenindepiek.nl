import { NextResponse } from 'next/server';
import { createGuide, getAllUsers } from '@/lib/db';
import { sendNewSubmissionEmail } from '@/lib/email';

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('reCAPTCHA secret key not configured, skipping verification');
    return true; // Skip verification if not configured
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();
    
    // Check if score is above threshold (0.5 is common for v3)
    return data.success && data.score >= 0.5;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { submitterName, submitterEmail, modelIds, steps, recaptchaToken } = await request.json();

    if (!submitterName || !modelIds || modelIds.length === 0 || !steps || steps.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Verify reCAPTCHA
    if (recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
      }
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

