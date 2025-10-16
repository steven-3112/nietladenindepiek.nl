import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, hasRole } from '@/lib/auth';
import { getAllBrandsWithGuideCount, createBrand, getBrandBySlug, createModel, getModelsByBrand } from '@/lib/db';

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
    const brandModelMap = new Map<string, Set<string>>();
    let importedBrands = 0;
    let importedModels = 0;

    // Parse the data and group models by brand
    for (const line of lines) {
      const columns = line.split('\t');
      if (columns.length >= 2) {
        const brandName = columns[0].trim();
        const modelName = columns[1].trim();
        
        if (brandName && modelName) {
          if (!brandModelMap.has(brandName)) {
            brandModelMap.set(brandName, new Set());
          }
          brandModelMap.get(brandName)!.add(modelName);
        }
      }
    }

    // Create brands and models
    for (const [brandName, modelNames] of Array.from(brandModelMap.entries())) {
      // Create or get brand
      const brandSlug = createSlug(brandName);
      let brand = await getBrandBySlug(brandSlug);
      
      if (!brand) {
        brand = await createBrand(brandName, brandSlug);
        importedBrands++;
      }

      // Create models for this brand
      const existingModels = await getModelsByBrand(brand.id, true);
      const existingModelNames = new Set(existingModels.map(m => m.name.toLowerCase()));

      for (const modelName of Array.from(modelNames)) {
        if (!existingModelNames.has(modelName.toLowerCase())) {
          const modelSlug = createSlug(modelName);
          await createModel(brand.id, modelName, modelSlug);
          importedModels++;
        }
      }
    }

    // Return updated brands list
    const updatedBrands = await getAllBrandsWithGuideCount(true);

    return NextResponse.json({
      success: true,
      importedBrands,
      importedModels,
      brands: updatedBrands
    });
  } catch (error) {
    console.error('Error importing brands and models:', error);
    return NextResponse.json({ error: 'Failed to import brands and models' }, { status: 500 });
  }
}
