import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      hasSession: !!session,
      user: session?.user || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({
      hasSession: false,
      error: 'Session check failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
