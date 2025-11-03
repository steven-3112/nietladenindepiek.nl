import { NextResponse } from 'next/server';
import { getAllBrandsWithGuideCount } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await getAllBrandsWithGuideCount();
    return NextResponse.json(brands, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

