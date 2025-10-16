import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { getPendingGuides } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !hasRole(session.user.roles, 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guides = await getPendingGuides();
    return NextResponse.json(guides);
  } catch (error) {
    console.error('Error fetching pending guides:', error);
    return NextResponse.json({ error: 'Failed to fetch guides' }, { status: 500 });
  }
}

