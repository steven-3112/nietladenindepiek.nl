import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { approveGuide, getGuideWithSteps, approveModel, approveBrand } from '@/lib/db';
import { sendApprovalEmail } from '@/lib/email';
import { sql } from '@vercel/postgres';

export async function POST(
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

    await approveGuide(guideId, parseInt(session.user.id));

    // Approve any pending models associated with this guide
    for (const model of guide.models) {
      const modelData = await sql`
        SELECT id, brand_id, status FROM models WHERE id = ${model.id}
      `;
      const modelRecord = modelData.rows[0];
      
      if (modelRecord && modelRecord.status === 'PENDING') {
        await approveModel(model.id);
        
        // Also approve the brand if it's pending
        const brandData = await sql`
          SELECT id, status FROM brands WHERE id = ${modelRecord.brand_id}
        `;
        const brandRecord = brandData.rows[0];
        
        if (brandRecord && brandRecord.status === 'PENDING') {
          await approveBrand(brandRecord.id);
        }
      }
    }

    // Send approval email
    if (guide.submitted_by_email) {
      const modelNames = guide.models.map(m => `${m.brand_name} ${m.name}`);
      await sendApprovalEmail(
        guide.submitted_by_email,
        guide.submitted_by_name,
        modelNames
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving guide:', error);
    return NextResponse.json({ error: 'Failed to approve guide' }, { status: 500 });
  }
}

