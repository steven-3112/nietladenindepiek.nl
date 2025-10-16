import { NextResponse } from 'next/server';
import { createGuide, getAllUsers, createBrand, createModel, getBrandBySlug } from '@/lib/db';
import { sendNewSubmissionEmail } from '@/lib/email';

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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
    const { submitterName, submitterEmail, modelIds, steps, recaptchaToken, newBrand, newModel } = await request.json();

    if (!submitterName || !steps || steps.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    if (!newModel && (!modelIds || modelIds.length === 0)) {
      return NextResponse.json({ error: 'At least one model must be selected or created' }, { status: 400 });
    }

    // Verify reCAPTCHA
    if (recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
      }
    }

    let finalModelIds = modelIds || [];

    // Handle new brand creation
    let brandId: number | null = null;
    if (newBrand && newBrand.name) {
      const brandSlug = createSlug(newBrand.name);
      // Check if brand already exists
      const existingBrand = await getBrandBySlug(brandSlug);
      if (existingBrand) {
        brandId = existingBrand.id;
      } else {
        // Create pending brand
        const createdBrand = await createBrand(newBrand.name, brandSlug, undefined, 'PENDING');
        brandId = createdBrand.id;
      }
    }

    // Handle new model creation
    if (newModel && newModel.name && brandId) {
      const modelSlug = createSlug(newModel.name);
      // Create pending model
      const createdModel = await createModel(
        brandId,
        newModel.name,
        modelSlug,
        newModel.yearRange || undefined,
        undefined,
        'PENDING'
      );
      finalModelIds = [createdModel.id];
    }

    if (finalModelIds.length === 0) {
      return NextResponse.json({ error: 'No models specified for guide' }, { status: 400 });
    }

    // Create the guide
    const guide = await createGuide(submitterName, submitterEmail, finalModelIds, steps);

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

