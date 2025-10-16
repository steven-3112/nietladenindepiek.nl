import { NextResponse } from 'next/server';
import { getBrandBySlug, getModelsByBrand } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const brand = await getBrandBySlug(params.slug);
    
    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const models = await getModelsByBrand(brand.id);
    return NextResponse.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}

