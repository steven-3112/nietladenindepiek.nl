import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { getAllBrands, createBrand, updateBrand, deleteBrand } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !hasRole(session.user.roles, 'CATALOG_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const brands = await getAllBrands();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !hasRole(session.user.roles, 'CATALOG_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, slug, logoUrl } = await request.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const brand = await createBrand(name, slug, logoUrl);
    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !hasRole(session.user.roles, 'CATALOG_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, slug, logoUrl } = await request.json();

    if (!id || !name || !slug) {
      return NextResponse.json({ error: 'ID, name and slug are required' }, { status: 400 });
    }

    const brand = await updateBrand(id, name, slug, logoUrl);
    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !hasRole(session.user.roles, 'CATALOG_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await deleteBrand(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}

