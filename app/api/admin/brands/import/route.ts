import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { getAllBrandsWithGuideCount, createBrand, getBrandBySlug } from '@/lib/db';

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !hasRole(session.user.roles, 'CATALOG_MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data } = await request.json();

    if (!data || typeof data !== 'string') {
      return NextResponse.json({ error: 'Import data is required' }, { status: 400 });
    }

    const lines = data.trim().split('\n');
    const brands = new Set<string>();
    let imported = 0;

    for (const line of lines) {
      const columns = line.split('\t');
      if (columns.length >= 1) {
        const brandName = columns[0].trim();
        if (brandName && !brands.has(brandName)) {
          brands.add(brandName);
          
          // Check if brand already exists
          const slug = createSlug(brandName);
          const existingBrand = await getBrandBySlug(slug);
          
          if (!existingBrand) {
            await createBrand(brandName, slug);
            imported++;
          }
        }
      }
    }

    // Return updated brands list
    const updatedBrands = await getAllBrandsWithGuideCount(true);

    return NextResponse.json({
      success: true,
      imported,
      brands: updatedBrands
    });
  } catch (error) {
    console.error('Error importing brands:', error);
    return NextResponse.json({ error: 'Failed to import brands' }, { status: 500 });
  }
}
